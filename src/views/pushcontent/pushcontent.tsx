// @ts-nocheck

import React, { Component, Fragment } from "react";
import { Row, Label, Col, Button, Input } from "reactstrap";
import { Dropdown } from 'primereact/dropdown';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { LoginResponse, PushContentMDL, Websites } from '../../models/index';
import "./pushcontent.css";
import { wglcsApiService } from "../../services/WglcsApiService";
import _ from "lodash";
import SnackBar from "../alert/SnackBar";
import ConfirmDialogDemo from "../alert/Dialog"
import TreeNode from "primereact/components/treenode/TreeNode";
import { InputText } from 'primereact/inputtext';
import validator from 'validator'
interface PContentState {
    nodes: TreeNode[];
    selectedItem: TreeNode | null;
    loading: boolean,
    expandedRows: any;
    userData: LoginResponse,
    websites: Websites[];
    selectedwebsite: Websites | null;
    loader: boolean,
    openSnackBar: boolean,
    severity: string,
    message: string,
    confirmation: boolean,
    confirmationMessage: string,
    isAccept: boolean,
    differentiate: string
    colors: any,
    count: Number,
    maxMessageId: Number,
    expandedKeys: {},
    validator: boolean,
    validurl: string,
    header:string
}

class PushContent extends Component<{}, PContentState> {

    constructor(props) {
        super(props);
        var userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse;
        this.state = {
            nodes: [],
            selectedItem: null,
            loading: true,
            expandedRows: null,
            userData: userData,
            websites: [],
            selectedwebsite: null,
            loader: false,
            openSnackBar: false,
            severity: '',
            message: '',
            confirmation: false,
            confirmationMessage: "",
            isAccept: false,
            differentiate: '',
            colors: [],
            count: 0,
            maxMessageId: 0,
            expandedKeys: {},
            validator: false,
            validurl: '',
            header:'Push Content'
        };

        this.transformToTree = this.transformToTree.bind(this);
        this.fillTreeRecursive = this.fillTreeRecursive.bind(this);
        this.sizeEditor = this.sizeEditor.bind(this);
    }
    componentDidMount = async () => {
        let arr = [{ id: 0, name: 'tesafd' }]
        this.setState({ websites: arr } as PContentState)
        this.serviceCalls()
    }


    serviceCalls = async () => {
        let auth_token = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse).accessToken.auth_token;
        wglcsApiService.setAuth(auth_token);
        var websites = (await wglcsApiService.getwebsitesbyempCompany(this.state.userData.userLoginData.empCompId)).data?.data ?? [];
        this.setState({ websites: websites, loading: false });
    }

    loadPushContent = async () => {
        if (this.state.selectedwebsite) {
            var data: PushContentMDL[] = (await wglcsApiService.getpushpagesbywebsiteid1(this.state.selectedwebsite.websiteId)).data?.data ?? [];
            if (data.length > 0) {
                var max = _.maxBy(data, item => item.pushID);
                this.setState({ maxMessageId: max!.pushID, count: data.length });
                var nodes = this.transformToTree(data);
                this.setState({ nodes: nodes });
            } else { this.setState({ loader: false, nodes: [] }) }
        } else {
            this.setState({ openSnackBar: true, severity: 'error', message: 'Please select website' })
        }
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

    sizeEditor(props) {
        return this.inputTextEditor(props, props.field);
    }

    validate(value) {
        if (!validator.isURL(value)) {
            this.setState({ validator: 'Please enter valid URL(www.google.com)' })
        } else {

            this.setState({ validator: '' })
        }
    }

    inputTextEditor(props, field) {
        if (field == 'pageTitle') {
            return (
                <Input type="text" placeholder='Title' className='pagetiletemplate2' value={props.node.data ? props.node.data.pageTitle : ''}
                    onChange={(e) => this.onEditorValueChange(props, e.target.value)}
                />
            );
        } else if (field == 'url') {
            return (
                <pre>
                    <Input type="text" placeholder='URL' className='pagetiletemplate2' value={props.node.data ? props.node.data.url : ''}
                        onChange={(e) => { this.onEditorValueChange(props, e.target.value); this.validate(e.target.value) }}
                    /><span style={{
                        fontWeight: 'bold',
                        color: 'red',
                    }}>{this.state.validator}</span>
                </pre>
            );
        }
    }

    onEditorValueChange(props, value) {
        let newNodes = JSON.parse(JSON.stringify(this.state.nodes));
        let editedNode = this.findNodeByKey(newNodes, props.node.key);
        editedNode!.data[props.field] = value;
        this.setState({
            nodes: newNodes
        });
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

    selectedWebsiteTemplate(option, props) {
        if (option) {
            return (
                <div className="country-item country-item-value">
                    <div>{option.domainName}</div>
                </div>
            );
        }
        return (
            <span>
                {props.placeholder}
            </span>
        );
    }

    onWebsiteChange(e) {
        this.setState({ selectedwebsite: e.value });
    }

    websiteOptionTemplate = (option) => {
        if (this.state.loading) {
            return (
                <div className="spinnerdiv"><i className="pi pi-spin pi-spinner" ></i></div>
            )
        }
        else {
            return (
                <div className="country-item">
                    <div>{option.domainName}</div>
                </div>
            );
        }
    }

    addFolder() {
        if (this.state.selectedwebsite) {
            var data: PushContentMDL = {
                websiteId: this.state.selectedwebsite!.websiteId, // TODO Put here Current DropDown WebsiteID,
                pushID: this.state.maxMessageId as any + 1,
                url: '',
                userTrainedOn:null,
                websiteInfo:null,
                parentId: -1,
                pageTitle: '' // TODO Put here Current DropDown LanguageID ,
            }
            var node: TreeNode = {
                children: [],
                key: data.pushID.toString(),
                data: data
            };
            let newNodes: TreeNode[] = JSON.parse(JSON.stringify(this.state.nodes));
            newNodes.push(node)
            this.setState({ nodes: newNodes, maxMessageId: this.state.maxMessageId as any + 1 });
            let array = this.mapArray(newNodes)
            this.setState({ count: array.length })
        }
    }

    onAddLink = () => {
        if (!this.state.selectedItem) {
            this.setState({ openSnackBar: true, severity: 'error', message: 'Please select Row first', confirmation: false })
            return null;
        }
        if (this.state.selectedItem.data.pageTitle == '' || this.state.selectedItem.data.pageTitle == '   ') {
            this.setState({ openSnackBar: true, severity: 'error', message: 'Please specify the Page Title', confirmation: false })
            return null;
        }
        var parentItem: PushContentMDL = (this.state.selectedItem.data) as PushContentMDL;
        var data: PushContentMDL = {
            websiteId: this.state.selectedwebsite!.websiteId, // TODO Put here Current DropDown WebsiteID,
            pushID: this.state.maxMessageId as any + 1,
            url: '',
            userTrainedOn:null,
            websiteInfo:null,
            parentId: parentItem.pushID,
            pageTitle: '' // TODO Put here Current DropDown LanguageID ,
        }

        var node: TreeNode = {
            children: [],
            key: data.pushID.toString(),
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

    getHeader(globalFilterKey) {
        return (
            <div className="p-text-right">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => this.setState({ [`${globalFilterKey}`]: e.target.value })} placeholder="Search" size="50" />
                </div>
            </div>
        );
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

    deleteRequest = () => {
        this.setState({
            confirmationMessage: "Are you sure you want to delete the information?",
            confirmation: true,
            differentiate: 'delete'
        })
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

    saveRequest = () => {
        this.setState({
            confirmationMessage: "Are you sure you want to save the information?",
            confirmation: true,
            differentiate: 'save'
        })
    }

    checkValid(data) {
        for (let index = 0; index < data.length; index++) {
            if (data[index].parentId == -1) {
                let noSpacesString = data[index].pageTitle.replace(/ /g, '');
                if (noSpacesString == '') {
                    this.setState({ openSnackBar: true, severity: 'error', message: 'Please specify the Page Title', confirmation: false })
                    return null
                }
            } else if (data[index].parentId != -1) {
                let noSpacesString = data[index].pageTitle.replace(/ /g, '');
                let noSpaceurl = data[index].url.replace(/ /g, '');
                if (noSpacesString == '') {
                    this.setState({ openSnackBar: true, severity: 'error', message: 'Please specify the Page Title', confirmation: false })
                    return null
                } else if (noSpaceurl == '') {
                    this.setState({ openSnackBar: true, severity: 'error', message: 'Please specify the URL', confirmation: false })
                    return null
                } else if (data[index].url != '') {
                    let checkvalid = validator.isURL(data[index].url);
                    if (!checkvalid) {
                        this.setState({ openSnackBar: true, severity: 'error', message: 'Please specify the valid URL : ' + data[index].url, confirmation: false })
                        return null
                    }
                }
                else {
                    this.setState({ confirmation: false })
                }
            } else { this.setState({ confirmation: false }); }
        }
        return data
    }

    onSavemessage = async () => {
        if (this.state.selectedwebsite) {
            var myArray = this.mapArray(this.state.nodes)
            let check1 = this.checkValid(myArray)
            if (check1 != undefined || check1 != null) {
                this.setState({ loader: true })
                var data = {
                    websiteId: this.state.selectedwebsite!.websiteId,
                    isEditBy: ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse).userLoginData.username,
                    pushPages: myArray,
                    pushPagesLogData: [{
                        "pushId": 0,
                        "websiteId": 0,
                        "url": "string",
                        "pageTitle": "string",
                        "parentId": 0,
                        "editBy": "string",
                        "editStatus": "string"
                    }]
                }
                await wglcsApiService.inserpushpagesall(data).then(async (response) => {
                    if (response.data.data) {
                        this.setState({ openSnackBar: true, loader:false, severity: 'success', message: 'Record has been saved successfully.' })
                        window.location.reload(true);
                    } else {
                        this.setState({ openSnackBar: true, severity: 'error', message: response.statusText })
                            this.setState({ loader: false })
                    }
                    this.setState({ confirmation: false })
                })
            }
        }
    }

    pageTitle = (node) => {
        if (node.data.pageTitle) {
            return <span className='pagetiletemplate2'>{node.data.pageTitle}</span>
        }
        else {
            return <Input type="text" placeholder='Title' className='pagetiletemplate2' value={node.data ? node.data.pageTitle : ''} />
        }
    }

    urlTemplate = (node) => {
        if (node.data.url) {
            return <span className='pagetiletemplate2'>{node.data.url}</span>
        }
        else if (node.data.parentId != -1) {
            return <Input type="text" placeholder='URL' className='pagetiletemplate2' value={node.data ? node.data.url : ''} />
        }
    }

    handleClose = (visible) => {
        this.setState({ confirmation: visible })
    }

    handleCloseSnackbar = (visible) => {
        this.setState({ openSnackBar: visible })
    }

    render() {
        let header = this.getHeader('globalFilter');
        return (
            <Fragment>
                <div className="row home-resources d-none d-md-block"><div className="col-12"><h6><a href="/">Home</a><span> / PushContent</span></h6></div></div>
                <div className="row d-md-flex d-none"><div className="col-md-6 resources-heading"><h1>Push Content</h1></div></div>
                <div className="dropdown-demo">
                    <Row style={{ display: 'flex' }}>
                        <Col className='displaywithsearch' xs={12} sm={6} md={6} lg={6}>
                            <div className='textbox-dropdown'>
                                <Label className='fontbold2 weblbl2'>Website</Label>
                                <Dropdown value={this.state.selectedwebsite} options={this.state.websites} onChange={(e) => this.onWebsiteChange(e)} optionLabel="domainName" filter filterMatchMode='contains' showClear filterBy="domainName" placeholder="Select a Website"
                                    className='websitedropdown2' valueTemplate={this.selectedWebsiteTemplate} itemTemplate={this.websiteOptionTemplate} />
                            </div>
                        </Col>
                        <Col className='loadmsg_btn' xs={12} sm={2} md={6} lg={6}>
                            <Button className='backgroundcolor2 btnwidth2 loadmsg_btn' onClick={() => { this.loadPushContent() }}>Load Messages</Button>
                        </Col>
                        </Row>
                    <Row>
                        <Col className='topmargin' xs={12} sm={12} md={12} lg={10}>
                            <Button className='btnwidth2' onClick={() => { this.addFolder() }}>Add Folder</Button>
                            <Button className='btnleft2 btnwidth2' onClick={() => this.onAddLink()}>Add Link</Button>
                            <Button className='btnleft2 btnwidth2' onClick={() => { this.saveRequest() }}>Save</Button>
                            <Button className='btnleft2 btnwidth2' onClick={() => { this.deleteRequest() }}>Delete</Button>

                            {/* <span>
                                <input disabled='true' style={{ marginLeft: 10 }} type="checkbox" />
                                <Label className='lockmsglbl2'>Lock Messages</Label>
                            </span> */}
                        </Col>
                    </Row>
                    <div className="pushtable">
                        <TreeTable value={this.state.nodes}
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
                            <Column field="pageTitle" editor={this.sizeEditor} body={this.pageTitle} header="Page Title" expander></Column>
                            <Column field="url" body={this.urlTemplate} editor={this.sizeEditor} header="URL"></Column>
                        </TreeTable>
                    </div>
                    <div className='divcount2'>
                        <Label className='lblcount2'>Count = {this.state.count}</Label>
                    </div>
                </div>
                <SnackBar open={this.state.openSnackBar} severity={this.state.severity} message={this.state.message} handleClose={(e) =>this.handleCloseSnackbar(e)}/>
                <ConfirmDialogDemo visible={this.state.confirmation} header={this.state.header} differentiate={this.state.differentiate} message={this.state.confirmationMessage} handleClose={(e) => this.handleClose(e)} handleAccept={(e, mode) => this.handleAccept(e, mode)} />
            </Fragment>

        );
    }
}

export default PushContent;
