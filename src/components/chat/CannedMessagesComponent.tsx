import React, { Component } from 'react';
import _ from "lodash";
import { CannedType, LoginResponse } from '../../models';
import { wglcsApiService } from '../../services/WglcsApiService'
import Spinner from "../spinner/spinner";
import EventEmitter from '../../services/eventemitter'
import { Events } from '../../models/events';
import { ICannedMessage } from '../../models/index';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import TreeNode from 'primereact/components/treenode/TreeNode';


interface CannedMessagesComponentState {
    checked: string[];
    expanded: string[];
    data: string;
    nodes: TreeNode[];
    loading: boolean;
    count: number;
    globalFilterKey: string;
}

interface CannedMessagesComponentProps {
    websiteId: number;
    userId: number;
    languageId: number;
    type: CannedType
}


class CannedMessagesComponent extends Component<CannedMessagesComponentProps, CannedMessagesComponentState> {
    constructor(props) {
        super(props);
        this.state = {
            checked: [],
            loading: true,
            expanded: [],
            data: '',
            nodes: [],
            count: 0,
            globalFilterKey: ""
        };

        // this.getHeader = this.getHeader.bind(this);
        this.transformToTree = this.transformToTree.bind(this);
        this.fillTreeRecursive = this.fillTreeRecursive.bind(this);
        this.getHighlightText = this.getHighlightText.bind(this);

        this.loadCannedMessages(false);

    }

    componentDidUpdate(prevProps: CannedMessagesComponentProps, prevState: CannedMessagesComponentState) {

        var prevPopVals = Object.keys(prevProps).map(prop => prevProps[prop].toString())
        var thisPropVals = Object.keys(prevProps).map(prop => this.props[prop].toString())

        if (_.difference(prevPopVals, thisPropVals).length > 0) {
            this.loadCannedMessages(true);
        }
    }

    loadCannedMessages = async (setLoading: boolean) => {

        if (this.props.websiteId == 0 || this.props.languageId == 0 || this.props.userId == 0) {
            return;
        }

        if (setLoading) {
            this.setState({
                loading: true
            });
        }

        var result: ICannedMessage[] = [];
        if (this.props.type == CannedType.User) {
            result = (await wglcsApiService.getpercannedmessagesbyuserid(this.props.userId, this.props.languageId)).data!.data;
        } else {
            result = (await wglcsApiService.getcannedmessagesbywebsite(this.props.websiteId, this.props.languageId)).data!.data;

        }

        var nodes = this.transformToTree(result);
        this.removeEmpty(nodes);

        this.setState({
            nodes: nodes,
            loading: false
        } as CannedMessagesComponentState);
    }

    removeEmpty = (obj) => {
        Object.keys(obj).forEach(key => {

            (key === 'children' && obj[key].length === 0) && delete obj[key] ||
                (obj[key] && typeof obj[key] === 'object') && this.removeEmpty(obj[key])
        });
        return obj;
    };

    transformToTree(data: ICannedMessage[]): TreeNode[] {

        var nodes = _.chain(data).filter((f: ICannedMessage) => f.parentId == -1)
            .map(item => this.fromCannedToTreeNode(item))
            .valueOf();
        this.fillTreeRecursive(nodes, data)

        return nodes;
    }

    fromCannedToTreeNode(item: ICannedMessage): TreeNode {
        item.messageText = item.messageText ?? item['descr'];
        return { data: item, key: (item.messageID ?? item['id']).toString() } as TreeNode;
    }

    fillTreeRecursive(nodes: TreeNode[], data: ICannedMessage[]) {
        for (let index = 0; index < nodes.length; index++) {
            const element = nodes[index];
            element.children = _.chain(data).filter((f: ICannedMessage) => f.parentId == (element.data as ICannedMessage).messageID)
                .map(item => this.fromCannedToTreeNode(item))
                .valueOf();

            this.fillTreeRecursive(element.children, data);
        }
    }

    getHighlightText(text: string, keyword: string) {

        const startIndex = text.indexOf(keyword);
        return startIndex !== 1 ? (
            <span>
                {text.substring(0, startIndex)}
                <span style={{ color: "blue" }}>
                    {text.substring(startIndex, startIndex + keyword.length)}
                </span>
                {text.substring(startIndex + keyword.length)}
            </span>
        ) : (
            <span>{text}</span>
        );
    };

    onItemSelected(val: TreeNode) {
        EventEmitter.emit(Events.OnMessageTextInput, (val.data as ICannedMessage).messageText ?? '');
        this.setState({ count: 0 })
    }

    rowClassName = (node: TreeNode) => {
        var obj = {};
        obj[`background-${(node.data as ICannedMessage).color?.toLowerCase() ?? 'none'}`] = true;

        return obj;
    };

    // getHeader() {
    //     return (
    //         // <div className="p-text-right">
    //         //     <div className="p-input-icon-left">
    //         //         <i className="pi pi-search"></i>
    //         //         <InputText type="search" onInput={(e) => this.setState({ globalFilterKey : (e.target as any).value })} placeholder="Global Search" size={50} />
    //         //     </div>
    //         // </div>
    //     //     <div className="form-group has-search">
    //     //     <span className="fa fa-search form-control-feedback"></span>
    //     //     <input size={50} onInput={(e) => this.setState({ globalFilterKey : (e.target as any).value })}
    //     //         placeholder="Search"
    //     //         type="text" className="form-control form-controls" />
    //     // </div>
    //     );
    // }

    render() {
        let clicks = [] as any;
        let timeout;
        const looding = this.state.loading;
        if (looding) {
            return (<Spinner />)
        } else {
            return (
                <div className="card shadow mb-4">
                    <div className="card-body p-c-msg">
                        <div className="personal-msgs">
                            <div>
                                <div className="form-group has-search">

                                    <input size={50} onInput={(e) => this.setState({ globalFilterKey: (e.target as any).value })}
                                        placeholder="Search"
                                        type="text" className="form-control form-controls" />
                                    <span className="font-icons">
                                      
                                        <i className="fa fa-search"></i>
                                    </span>
                                    <i title="Refresh" className="fa fa-refresh"  onClick={()=>this.loadCannedMessages(true)}></i>

                                </div>


                                <TreeTable
                                    className=".p-treetable .p-treetable-header"
                                    scrollable
                                    scrollHeight="350px"
                                    value={this.state.nodes}
                                    selectionMode="multiple"
                                    rowClassName={this.rowClassName}
                                    onSelect={e => {
                                        if (e.node.children == undefined) {

                                            clicks.push(new Date().getTime());
                                            window.clearTimeout(timeout);
                                            timeout = window.setTimeout(() => {
                                                if (clicks.length > 1 && clicks[clicks.length - 1] - clicks[clicks.length - 2] < 250) {
                                                    this.onItemSelected(e.node)
                                                } else {
                                                    //singleClick(event.target);
                                                }
                                            }, 250);

                                        }
                                    }}
                                    // header={this.getHeader()}
                                    globalFilter={this.state.globalFilterKey}


                                >
                                    <Column colSpan={5} field="messageText" expander></Column>

                                </TreeTable>
                                {/* <CheckboxTree
                                    onClick={(click) => { if((click as any).children==undefined){

                                       
                                        clicks.push(new Date().getTime() );
                                        window.clearTimeout(timeout);
                                        timeout = window.setTimeout(() => {
                                            if (clicks.length > 1 && clicks[clicks.length - 1] - clicks[clicks.length - 2] < 250) {
                                                this.onItemSelected(click.value)
                                            } else {
                                                //singleClick(event.target);
                                            }
                                        }, 250);



                                    //   this.setState({count:this.state.count+1})   
                                    //     if(this.state.count>=1){
                                    //     this.onItemSelected(click.value) }
                                    
                                    }}
                                        }
                                    icons={
                                        {leaf: <span></span>}
                                    }
                                /> */}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}

export default CannedMessagesComponent;
