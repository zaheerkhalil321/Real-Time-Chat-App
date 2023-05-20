import React from "react";
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { wglcsApiService } from '../../services/WglcsApiService'
import EventEmitter from '../../services/eventemitter'
import { Events } from '../../models/events';
import { PushContentMDL } from '../../models/index';
import Spinner from "./../../components/spinner/spinner";
import _ from "lodash";
import { InputText } from 'primereact/inputtext';
import TreeNode from "primereact/components/treenode/TreeNode";
interface PushContentProps {
    websiteId: number;
}

interface PushContentState {
    expandedRows: any;
    loading: boolean;
    filter: string;
    nodes: TreeNode[];
    globalFilter: any

}

class PushContent extends React.Component<PushContentProps, PushContentState> {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            filter: '',
            expandedRows: null,
            nodes: [],
            globalFilter: null
        };

        this.loadPushPages(false);
    }

    componentDidUpdate(prevProps: PushContentProps, prevState: PushContentState) {
        if ((prevProps.websiteId != this.props.websiteId)) {

            this.loadPushPages(true);
        }
    }

    loadPushPages = async (setLoading: boolean) => {

        if (this.props.websiteId == 0) {
            return;
        }

        if (setLoading) {
            this.setState({
                loading: true
            });
        }

        var result: PushContentMDL[] = (await wglcsApiService.getpushpagesbywebsiteid(this.props.websiteId)).data?.data as any ?? [];
        var nodes = this.transformToTree(result);
        this.setState({
            loading: false,
            nodes: nodes
        })
    }

    transformToTree(data: PushContentMDL[]): TreeNode[] {
        var nodes = _.chain(data).filter((f: PushContentMDL) => f.parentId == -1)
            .map(item => this.fromCannedToTreeNode(item))
            .valueOf();
        this.fillTreeRecursive(nodes, data);
        return nodes;
    }

    fromCannedToTreeNode(item: PushContentMDL): TreeNode {
        return { data: item, key: item.pushID.toString() } as TreeNode;
    }

    fillTreeRecursive(nodes: TreeNode[], data: PushContentMDL[]) {
        for (let index = 0; index < nodes.length; index++) {
            const element = nodes[index];
            element.children = _.chain(data).filter((f: PushContentMDL) => f.parentId.toString() == (element.data as PushContentMDL).pushID.toString())
                .map(item => this.fromCannedToTreeNode(item))
                .valueOf();
            this.fillTreeRecursive(element.children, data);
        }
    }

    onRowGroupExpand = (events) => {
        return
    }

    onRowGroupCollapse = (events) => {
        return
    }

    headerTemplate = (data) => {
        return (
            <span className="image-text">{data.pageTitle}</span>
        );
    }

    footerTemplate = (data: any, index: number): React.ReactNode | undefined => {
        return
    }


    render() {
        const looding = this.state.loading;
        if (looding) {
            return (<Spinner />)
        } else {
            return (
                <>
                    <div className="card shadow mb-4">
                        <div className="card-body p-c-msg">
                            <div className="form-group has-search">
                                <span className="fa fa-search form-control-feedback"></span>
                                <input onChange={(e) => this.setState({ globalFilter: (e.target as any).value })}
                                    placeholder="Search"
                                    type="text" className="form-control form-controls" />
                                       <span className="font-icons">
                                      
                                      <i className="fa fa-search"></i>
                                  </span>
                                  <i title="Refresh" className="fa fa-refresh" onClick={()=>this.loadPushPages(true)}></i>
                            </div>

                            <div id="accordion" className="personal-msgs">
                                <div className="card">
                                    <div className=" card-head">

                                        <div className="pushtable">
                                            <TreeTable value={this.state.nodes}
                                                selectionMode="single"
                                                scrollable scrollHeight="400px"
                                                loading={this.state.loading}
                                                globalFilter={this.state.globalFilter}
                                            >
                                                <Column field="pageTitle" header="Page Title" expander></Column>
                                                <Column field="url" header="URL"></Column>
                                            </TreeTable>
                                        </div>
                                    </div>
                                    <div id="collapseOne" className="collapse" >
                                        <div className="card-body">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )
        }
    }
}

export default PushContent;
