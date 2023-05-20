// @ts-nocheck

import React, { Component, Fragment } from "react";
import { Row, Label, Col, Button, Input } from "reactstrap";
import { Dropdown } from 'primereact/dropdown';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { LoginResponse, PersonalCannedMessages1 } from '../../models/index';
import "./personalcanned.css";
import { wglcsApiService } from "../../services/WglcsApiService";
import _ from "lodash";
import TreeNode from "primereact/components/treenode/TreeNode";
import SnackBar from "../alert/SnackBar";
import ConfirmDialogDemo from "../alert/Dialog"
import { InputText } from 'primereact/inputtext';
interface PCannedState {
    nodes: TreeNode[];
    selectedItem: TreeNode | null;
    loading: true,
    expandedRows: any;
    userData: LoginResponse,
    maxMessageId: Number,
    disabled: boolean,
    expandedKeys: {},
    confirmationMessage: string,
    confirmation: boolean,
    differentiate: string,
    openSnackBar: boolean,
    severity: string,
    message: string,
    loader: boolean,
    count: Number,
    globalFilter: string,
    header: string
}

class PersonalCanned extends Component<{}, PCannedState> {

    constructor(props) {
        super(props);
        var userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse;
        this.state = {
            nodes: [],
            selectedItem: null,
            loading: true,
            expandedRows: null,
            userData: userData,
            maxMessageId: 0,
            disabled: true,
            expandedKeys: {},
            confirmationMessage: '',
            confirmation: false,
            differentiate: '',
            openSnackBar: false,
            severity: '',
            message: '',
            loader: false,
            count: 0,
            globalFilter: '',
            header: 'Personal Canned'
        };

        this.transformToTree = this.transformToTree.bind(this);
        this.fillTreeRecursive = this.fillTreeRecursive.bind(this);
        this.sizeEditor = this.sizeEditor.bind(this);
    }
    componentDidMount = async () => {
        this.serviceCall();
        let colors = [
            { name: 'Blue', value: "Blue" },
            { name: 'Green', value: "Green" },
            { name: 'Red', value: "Red" },
            { name: 'Yellow', value: "Yellow" },
            { name: 'White', value: "White" },
            { name: 'Black', value: "Black" }
        ];
        this.setState({ colors: colors });
    }

    serviceCall = async () => {
        this.setState({ loader: true })
        let auth_token = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse).accessToken.auth_token;
        wglcsApiService.setAuth(auth_token);
        var data: PersonalCannedMessages1[] = (await wglcsApiService.getpercannedmessagesbyuserid_new(this.state.userData.userLoginData.userId, this.state.userData.userLoginData.languageId)).data?.data ?? [];
        if (data.length > 0) {
            var max = _.maxBy(data, item => item.messageID);
            this.setState({ maxMessageId: max!.messageID, count: data.length });
            var nodes = this.transformToTree(data);
            this.setState({ nodes: nodes, loader: false, disabled: false });
        } else { this.setState({ loader: false, nodes: [] }) }
    }

    transformToTree(data: PersonalCannedMessages1[]): TreeNode[] {
        var nodes = _.chain(data).filter((f: PersonalCannedMessages1) => f.parentId == -1)
            .map(item => this.fromCannedToTreeNode(item))
            .valueOf();
        this.fillTreeRecursive(nodes, data);
        return nodes;
    }

    fromCannedToTreeNode(item: PersonalCannedMessages1): TreeNode {
        return { data: item, key: item.messageID.toString() } as TreeNode;
    }

    fillTreeRecursive(nodes: TreeNode[], data: PersonalCannedMessages1[]) {
        for (let index = 0; index < nodes.length; index++) {
            const element = nodes[index];
            element.children = _.chain(data).filter((f: PersonalCannedMessages1) => f.parentId.toString() == (element.data as PersonalCannedMessages1).messageID.toString())
                .map(item => this.fromCannedToTreeNode(item))
                .valueOf();
            this.fillTreeRecursive(element.children, data);
        }
    }

    sizeEditor(props) {
        return this.inputTextEditor(props, props.field);
    }

    inputTextEditor(props, field) {
        if (field == 'messageText') {
            return (
                <Input type="text" placeholder='Write Here' style={{ width: '30%', display: 'inline' }} value={props.node.data ? props.node.data.messageText : ''}
                    onChange={(e) => this.onEditorValueChange(props, e.target.value)}
                />
            );
        } else if (field == 'color') {
            return (
                <Dropdown style={{ width: '100%', height: '35px' }} value={props.node.data ? props.node.data.color : 'White'} options={this.state.colors} onChange={(e) => this.onEditorValueChange(props, e.target.value)} optionLabel="name"
                    valueTemplate={this.selectedColorTemplate} itemTemplate={this.colorOptionTemplate} />
            );
        } else if (field == 'pcmType') {
            return (
                <Input type="text" value={props.node.data ? props.node.data.pcmType : ''}
                    onChange={(e) => this.onEditorValueChange(props, e.target.value)}
                />
            );
        }
    }

    selectedColorTemplate(option, props) {
        if (option) {
            return (
                <div className="country-item country-item-value">
                    <div style={{
                        width: ' 20px',
                        height: ' 20px',
                        border: '1px solid black',
                        boxSizing: 'border-box',
                        backgroundColor: option.name,
                        position: 'absolute',
                    }}></div>
                    <div style={{ marginLeft: '30px' }}>{option.name}</div>
                </div>
            );
        }
        return (
            <span>
                {props.placeholder}
            </span>
        );
    }

    colorOptionTemplate(option) {
        return (
            <div >
                <div style={{
                    width: ' 20px',
                    height: ' 20px',
                    border: '1px solid black',
                    boxSizing: 'border-box',
                    backgroundColor: option.name,
                    position: 'absolute',
                }}></div>
                <div style={{ marginLeft: '30px' }}>{option.name}</div>
            </div>
        );
    }

    onEditorValueChange(props, value) {
        let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        let editedNode = this.findNodeByKey(newNodes, props.node.key);
        editedNode!.data[props.field] = value;
        this.setState({
            nodes: newNodes
        });
    }

    findNodeByKey(nodes: TreeNode[], key: any): TreeNode | null {
        for (let index = 0; index < nodes.length; index++) {
            const nodeElement = nodes[index];
            if (nodeElement.key === key) {
                return nodeElement;
            }
            var fromChildren = this.findNodeByKey(nodeElement.children, key);
            if (fromChildren != null) {
                return fromChildren;
            }
        }
        return null;
    }


    onAddMessage = () => {
        if (!this.state.selectedItem) {
            return null;
        }
        var parentItem: PersonalCannedMessages1 = (this.state.selectedItem.data) as PersonalCannedMessages1;
        var data: PersonalCannedMessages1 = {
            userId: this.state.userData.userLoginData.userId,
            messageID: this.state.maxMessageId as any + 1,
            messageText: '',
            parentId: parentItem.messageID,
            color: 'White',
            languageId: this.state.userData.userLoginData.languageId,
            pcmType: '',
            serialId: null,
            sortBy: null,
        };

        var node: TreeNode = {
            children: [],
            key: data.messageID.toString(),
            data: data
        };
        this.toggleApplications(this.state.selectedItem?.key)
        let newNodes: TreeNode[] = JSON.parse(JSON.stringify(this.state.nodes));
        var foundNode = this.findNodeByKey(newNodes, this.state.selectedItem.key)!;
        foundNode.children.push(node);
        this.setState({ nodes: newNodes, maxMessageId: this.state.maxMessageId as any + 1, count: newNodes.length });
        let array = this.mapArray(newNodes)
        this.setState({ count: array.length })
    }

    toggleApplications = (key) => {
        let _expandedKeys = { ...this.state.expandedKeys };
        if (_expandedKeys[key])
            delete _expandedKeys[key];
        else
            _expandedKeys[key] = true;
        this.setState({ expandedKeys: _expandedKeys });
    }

    addFolder() {
        var data: PersonalCannedMessages1 = {
            userId: this.state.userData.userLoginData.userId,
            messageID: this.state.maxMessageId as any + 1,
            messageText: '',
            parentId: -1,
            color: 'White',
            languageId: this.state.userData.userLoginData.languageId,
            pcmType: '',
            serialId: null,
            sortBy: null,
        }
        var node: TreeNode = {
            children: [],
            key: data.messageID.toString(),
            data: data
        };
        let newNodes: TreeNode[] = JSON.parse(JSON.stringify(this.state.nodes));
        newNodes.push(node)
        this.setState({ nodes: newNodes, count: newNodes.length, maxMessageId: this.state.maxMessageId as any + 1 });
        let array = this.mapArray(newNodes)
        this.setState({ count: array.length })
    }

    messageTemplate = (node) => {
        if (node.data.messageText) {
            return <span style={{ width: '30%', display: 'inline' }}>{node.data.messageText}</span>
        }
        else {
            return <Input type="text" placeholder='Write Here' style={{ width: '30%', display: 'inline' }} value={node.data ? node.data.messageText : ''} />
        }
    }

    colorTemplate = (node) => {
        if (node.data.color) {
            return <div className="country-item country-item-value">
                <div style={{
                    width: ' 20px',
                    height: ' 20px',
                    border: '1px solid blach',
                    boxSizing: 'border-box',
                    backgroundColor: node.data.color,
                    position: 'absolute',
                }}></div>
                <div style={{ marginLeft: '30px' }}>{node.data.color}</div>
            </div>
        }
    }

    deleteRequest = () => {
        this.setState({
            confirmationMessage: "Are you sure you want to delete the information?",
            confirmation: true,
            differentiate: 'delete'
        })
    }

    handleAccept = (e, mode) => {
        if (e && mode == 'save') {
            this.onSavemessage()
        } else if (e && mode == 'delete' && this.state.selectedItem) {
            this.removeRecord(this.state.nodes, this.state.selectedItem)
        }
        else {
            this.setState({
                confirmation: false
            })
        }
    }

    handleClose = (visible) => {
        this.setState({ confirmation: visible })
    }

    saveRequest = () => {
        this.setState({
            confirmationMessage: "Are you sure you want to save the information?",
            confirmation: true,
            differentiate: 'save'
        })
    }
    mapArray = (node) => {
        var tempArray = [] as any
        node.forEach(element => {
            tempArray.push(element.data)
            if (element.children.length > 0) {
                let arr = this.mapArray(element.children)
                tempArray.push(...arr)
            }
        });
        return tempArray;
    }
    onSavemessage = async () => {
        var myArray = this.mapArray(this.state.nodes)
        var data = this.checkValid(myArray);
        if (data != undefined || data != null) {
            this.setState({ loader: true })
            await wglcsApiService.savepersonalcannedmessagesnew(data).then(async (response) => {
                if (response.data.data) {
                    var data: PersonalCannedMessages1 = (await wglcsApiService.getpercannedmessagesbyuserid_new(this.state.userData.userLoginData.userId, this.state.userData.userLoginData.languageId)).data?.data ?? [];
                    if (data.length > 0) {
                        var max = _.maxBy(data, item => item.messageID);
                        this.setState({ maxMessageId: max!.messageID });
                        var nodes = this.transformToTree(data);
                        this.setState({ nodes: nodes, loader: false, disabled: false });
                    } else { this.setState({ loader: false, nodes: [] }) }
                    this.setState({ openSnackBar: true, severity: 'success', message: 'Record has been saved successfully.' })
                } else {
                    this.setState({ openSnackBar: true, severity: 'error', message: response.problem })
                        this.setState({loader: false })
                }
                this.setState({ confirmation: false })
            })
        }
    }

    checkValid(data) {
        for (let index = 0; index < data.length; index++) {
            var noSpacesString = data[index].messageText.replace(/ /g, '');
            if (noSpacesString == '') {
                this.setState({ openSnackBar: true, severity: 'error', message: 'Please specify the Message Text', confirmation: false })
                return null
            }
        }
        return data
    }


    getHeader(globalFilterKey) {
        return (
            <div className="p-text-right search-css">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => this.setState({ [`${globalFilterKey}`]: e.target.value })} placeholder="Search" size="50" />
                </div>
            </div>
        );
    }

    removeRecord = (nodes, item) => {
        if (this.state.confirmation) {
            for (let index = 0; index < nodes.length; index++) {
                if (nodes[index].key === item?.key) {
                    nodes.splice(index, 1)
                    let array = this.mapArray(nodes)
                    return this.setState({ nodes: nodes, count: array.length, loader: false, confirmation: false, selectedItem: null })
                } else if (nodes[index].children.length > 0) {
                    let arr = this.removeWithinChildren(nodes[index].children, item?.key)
                    if (arr) {
                        let array = this.mapArray(nodes)
                        return this.setState({ nodes: nodes, count: array.length, confirmation: false, loader: false, selectedItem: null })
                    }
                }
            }
        }
    }

    removeWithinChildren = (children, key) => {
        for (let index = 0; index < children.length; index++) {
            const nodeElement = children[index];
            if (nodeElement.key === key) {
                children.splice(children[index], 1)
                return children;
            }
            var fromChildren = this.removeWithinChildren(nodeElement.children, key);
            if (fromChildren != null) {
                return children;
            }
        }
        return null;
    }

    handleCloseSnackbar = (visible) => {
        this.setState({ openSnackBar: visible })
    }

    render() {
        let header = this.getHeader('globalFilter');
        return (
            <Fragment>
                <div className="row home-resources d-none d-md-block"><div className="col-12"><h6><a href="/">Home</a><span> / PersonalCanned</span></h6></div></div>
                <div className="row d-md-flex d-none"><div className="col-md-6 resources-heading"><h1>Personal Canned</h1></div></div>
                <Row>
                    <Col className='btnrow1' xs={12} sm={12} md={12} lg={12}>
                        <Button className='topbtns1' onClick={() => { this.addFolder() }}>Add Folder</Button>
                        <Button className='btnleft1 topbtns1' onClick={() => this.onAddMessage()}>Add Message</Button>
                        <Button className='btnleft1 topbtns1' onClick={() => { this.deleteRequest() }}>Delete</Button>
                        <Button className='btnleft1 topbtns1' onClick={() => { this.saveRequest() }}>Save</Button>
                        <Button className='btnleft1 topbtns1'>Cancel</Button>
                        {/* <span>
                            <input disabled='true' style={{ marginLeft: 10 }} type="checkbox" />
                            <Label disabled='true' className='lockmsglbl'>Rearrange</Label>
                        </span> */}
                    </Col>
                </Row>
                <div className="card">
                    <div className='tbl_height'>
                        <TreeTable value={this.state.nodes}
                            onRowReorder={(e) => this.setState({ nodes: e.value })}
                            reorderableColumns={true}
                            selectionMode="single"
                            scrollable scrollHeight="400px"
                            loading={this.state.loader}
                            expandedKeys={this.state.expandedKeys}
                            onToggle={e => this.setState({ expandedKeys: e.value })}
                            selectionKeys={this.state.selectedItem}
                            onSelect={e => this.setState({ selectedItem: e.node })}
                            globalFilter={this.state.globalFilter}
                            header={header}
                        >
                            <Column rowReorder style={{ width: '2em' }} />
                            <Column field="messageText" editor={this.sizeEditor} body={this.messageTemplate} header="Message Text" expander></Column>
                            <Column field="color" className='colwidth1' body={this.colorTemplate} editor={this.sizeEditor} header="Color"></Column>
                        </TreeTable>
                        </div>
                    </div>
                <div className='divcount1'>
                    <Label className='lblcount1'>Count = {this.state.count}</Label>
                </div>
                <SnackBar open={this.state.openSnackBar} severity={this.state.severity} message={this.state.message} handleClose={(e) =>this.handleCloseSnackbar(e)}/>
                <ConfirmDialogDemo header={this.state.header} visible={this.state.confirmation} differentiate={this.state.differentiate} message={this.state.confirmationMessage} handleClose={(e) => this.handleClose(e)} handleAccept={(e, mode) => this.handleAccept(e, mode)} />
            </Fragment >

        );
    }
}

export default PersonalCanned;
