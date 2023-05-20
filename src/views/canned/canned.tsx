import React, { Component, Fragment } from "react";
import { Row, Label, Col, Button, Input } from "reactstrap";
import { Dropdown } from 'primereact/dropdown';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';
import { LoginResponse, CannedMessageWithExpiry, Websites, LanguagesMdl } from '../../models/index';
import _, { capitalize } from "lodash";
import "./canned.css";
import { wglcsApiService } from "../../services/WglcsApiService";
import TreeNode from "primereact/components/treenode/TreeNode";
import moment from "moment";
import SnackBar from "./../alert/SnackBar";
import { Dialog } from 'primereact/dialog';
import ConfirmDialogDemo from "../alert/Dialog"
import { InputText } from 'primereact/inputtext';
import ExportData from './export'
import { FileUpload } from 'primereact/fileupload';
import { ExcelRenderer } from 'react-excel-renderer';
interface CannedState {
    nodes: TreeNode[];
    selectedItem: TreeNode | null;
    websites: Websites[],
    languages: LanguagesMdl[],
    loading: boolean,
    expandedRows: any;
    userData: LoginResponse,
    selectedlanguage: LanguagesMdl | null,
    selectedwebsite: Websites | null,
    maxMessageId: Number,
    maxSort: null,
    expandedKeys: {},
    loader: boolean,
    openSnackBar: boolean,
    severity: string,
    message: string,
    confirmation: boolean,
    confirmationMessage: string,
    isAccept: boolean,
    differentiate: string
    colors: any,
    date: string,
    disabled: boolean,
    globalFilter: any,
    export: boolean,
    importedCols: [{ field: string, header: string }],
    importedData: TreeNode[],
    importData: boolean,
    displayBasic: boolean,
    header:string,
    count:Number
}

class Canned extends Component<{}, CannedState> {

    constructor(props) {
        super(props);
        var userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse;
        this.state = {
            nodes: [],
            selectedItem: null,
            websites: [],
            languages: [],
            loading: true,
            expandedRows: null,
            userData: userData,
            selectedlanguage: null,
            selectedwebsite: null,
            maxMessageId: 0,
            maxSort: null,
            expandedKeys: {},
            loader: false,
            openSnackBar: false,
            severity: '',
            message: '',
            confirmation: false,
            confirmationMessage: "",
            isAccept: false,
            differentiate: '',
            colors: [],
            date: '',
            disabled: true,
            globalFilter: null,
            export: false,
            importedCols: [{ field: '', header: 'Header' }],
            importedData: [],
            importData: false,
            displayBasic: false,
            header:'Canned Responses',
            count:0
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
        this.setState({ colors: colors })
    }

    serviceCall = async () => {
        let arr = [{ id: 0, name: 'test' }]
        this.setState({ websites: arr, languages: arr } as unknown as CannedState)
        var websites = (await wglcsApiService.getwebsitesbyempCompany(this.state.userData.userLoginData.empCompId)).data?.data ?? [];
        this.setState({ websites: websites, loading: false });
        var languages = (await wglcsApiService.getempcompanylanguagesdetail()).data?.data ?? [];
        this.setState({ languages: languages, loading: false });
    }

    loadMessages = async () => {
        if (this.state.selectedwebsite && this.state.selectedlanguage) {
            this.setState({ loader: true })
            var data: CannedMessageWithExpiry[] = (await wglcsApiService.getcannedmessagestablebywebsite_withexpiry(this.state.selectedwebsite!.websiteId, this.state.selectedlanguage!.languageId)).data?.data ?? [];
            if (data.length > 0) {
                console.log(data, ' data from api')
                var max = _.maxBy(data, item => item.messageID);
                this.setState({ maxMessageId: max!.messageID,count:data.length });
                let data1 = data.filter((item) => {
                    if (item.expiryDate) {
                        let formatr = moment(item.expiryDate).format('MM/DD/YYYY').toString()
                        item.expiryDate = formatr
                        return item
                    } else { return item }
                })
                var nodes = this.transformToTree(data1);
                this.setState({ nodes: nodes, loader: false, disabled: false });
            } else { this.setState({ loader: false, nodes: [] }) }
        } else {
            this.setState({ openSnackBar: true, severity: 'error', message: 'Please select website and language' })
        }
    }

    transformToTree(data: CannedMessageWithExpiry[]): TreeNode[] {
        console.log(data, 'data in transform to tree')
        var nodes = _.chain(data).filter((f: CannedMessageWithExpiry) => f.parentId == -1)
            .map(item => this.fromCannedToTreeNode(item))
            .valueOf();
        this.fillTreeRecursive(nodes, data);
        return nodes;
    }

    fromCannedToTreeNode(item: CannedMessageWithExpiry): TreeNode {
        return { id: item.messageID, children: item as unknown, data: item, key: item.messageID.toString() } as TreeNode;
    }

    fillTreeRecursive(nodes: TreeNode[], data: CannedMessageWithExpiry[]) {
        console.log(nodes.length, 'length of nodes')
        for (let index = 0; index < nodes.length; index++) {
            const element = nodes[index];
            element.children = _.chain(data).filter((f: CannedMessageWithExpiry) => f.parentId.toString() == (element.data as CannedMessageWithExpiry).messageID.toString())
                .map(item => this.fromCannedToTreeNode(item))
                .valueOf();

            this.fillTreeRecursive(element.children, data);
        }
    }

    selectedWebsiteTemplate(option, props) {
        if (option) {
            return (
                <div>{option.domainName}</div>
            );
        }
        return (
            <span>{props.placeholder}</span>
        );
    }

    selectedLanguage(option, props) {
        if (option) {
            return (
                <div className="country-item country-item-value">
                    <div>{option.languageName}</div>
                </div>
            );
        }
        return (
            <span> {props.placeholder} </span>
        );
    }

    websiteOptionTemplate = (option) => {
        if (this.state.loading) {
            return (
                <div className="loader-div"><i className="pi pi-spin pi-spinner" ></i></div>
            )
        }
        else {
            return (
                <div>{option.domainName}</div>
            );
        }
    }

    languageOptionTemplate = (option) => {
        if (this.state.loading) {
            return (
                <div className="loader-div"><i className="pi pi-spin pi-spinner" ></i></div>
            )
        }
        else {
            return (
                <div className="country-item"> <div> {option.languageName} </div> </div>
            );
        }
    }

    onWebsiteChange(e) {
        this.setState({ selectedwebsite: e.value });
    }

    onLanguageChange(e) {
        this.setState({ selectedlanguage: e.target.value });
    }

    onAddMessage = () => {
        if (this.state.selectedItem == null) {
            return null;
        }
        var parentItem: CannedMessageWithExpiry = (this.state.selectedItem.data) as CannedMessageWithExpiry;
        var data: CannedMessageWithExpiry = {
            websiteId: this.state.selectedwebsite!.websiteId, // TODO Put here Current DropDown WebsiteID,
            messageID: (this.state.maxMessageId as number) + 1,
            messageText: '',
            parentId: parentItem.messageID,
            languageId: this.state.selectedlanguage!.languageId, // TODO Put here Current DropDown LanguageID ,
            color: 'White',
            sortBy: parentItem.sortBy as any + 1,
            expiryDate: '',
            ticketNo: ''
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
        this.setState({ nodes: newNodes, maxMessageId: this.state.maxMessageId as any + 1 });
        let array = this.mapArray(newNodes)
        this.setState({ count: array.length })
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

    removeRecord = (nodes, item) => {
        if (this.state.confirmation) {
            for (let index = 0; index < nodes.length; index++) {
                if (nodes[index].key === item?.key) {
                    nodes.splice(index, 1)
                    let array = this.mapArray(nodes)
                    return this.setState({ nodes: nodes, count:array.length, loader: false, confirmation: false, selectedItem: null })
                } else if (nodes[index].children.length > 0) {
                    let arr = this.removeWithinChildren(nodes[index].children, item?.key)
                    if (arr) {
                        let array = this.mapArray(nodes)
                        return this.setState({ nodes: nodes,count:array.length, confirmation: false, loader: false, selectedItem: null })
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

    saveRequest = () => {
        this.setState({
            confirmationMessage: "Are you sure you want to save the information?",
            confirmation: true,
            differentiate: 'save'
        })
    }

    onClick() {
        if (this.state.selectedwebsite && this.state.selectedlanguage) {
            this.setState({ displayBasic: true });
        }
        else{
            this.setState({ openSnackBar: true, severity: 'error', message: 'Please fetch data first' })
        }
    }

    onHide() {
        this.setState({
            displayBasic: false
        });
    }

    renderFooter(name) {
        return (
            <div>
                <Button label="No" icon="pi pi-times" onClick={() => this.onHide()} className="p-button-text">No</Button>
                <FileUpload chooseOptions={{ label: 'Yes' }} mode="basic" name="demo[]" auto url="https://primefaces.org/primereact/showcase/upload.php"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onUpload={this.fileHandler} />
            </div>
        );
    }
    onSavemessage = async () => {
        var myArray = this.mapArray(this.state.nodes)
        var check = this.checkValid(myArray);
        if (check != undefined || check != null && this.state.selectedwebsite && this.state.selectedlanguage) {
            this.setState({ loader: true })
            var data = {
                websiteId: this.state.selectedwebsite!.websiteId,
                languageId: this.state.selectedlanguage!.languageId,
                userName: ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse).userLoginData.username,
                cannedMessagesInsert: myArray,
                cannedMessagesLogInsert: [
                    {
                        "websiteId": 0,
                        "messageId": 0,
                        "messageText": "string",
                        "parentId": 0,
                        "languageId": 0,
                        "color": "string",
                        "sort": 0,
                        "expiryDate": "2021-05-21T11:10:52.202Z",
                        "ticketNo": "string",
                        "editBy": "string",
                        "editDate": "2021-05-21T11:10:52.202Z",
                        "editStatus": "string"
                    }
                ]
            };
            await wglcsApiService.savecannedmessages_expirydate_ticketno(data).then(async (response) => {
                if (response.status == 200) {
                    var data: CannedMessageWithExpiry[] = (await wglcsApiService.getcannedmessagestablebywebsite_withexpiry(this.state.selectedwebsite!.websiteId, this.state.selectedlanguage!.languageId)).data?.data ?? [];
                    if (data.length > 0) {
                        var max = _.maxBy(data, item => item.messageID);
                        this.setState({ maxMessageId: max!.messageID });
                        let data1 = data.filter((item) => {
                            if (item.expiryDate) {
                                let formatr = moment(item.expiryDate).format('MM/DD/YYYY').toString()
                                item.expiryDate = formatr
                                return item
                            } else { return item }
                        })
                        var nodes = this.transformToTree(data);
                        this.setState({ nodes: nodes, loader: false });
                    } else { this.setState({ loader: false, nodes: [] }) }

                    this.setState({ openSnackBar: true, severity: 'success', message: 'Record has been saved successfully.' })
                } else {
                    this.setState({ openSnackBar: true, severity: 'error', message: response.data as any })
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
                <div className='colordropdown'>
                    <Dropdown style={{ width: '100%', height: '35px' }} value={props.node.data ? props.node.data.color : 'White'} options={this.state.colors} onChange={(e) => this.onEditorValueChange(props, e.target.value)} optionLabel="name"
                        valueTemplate={this.selectedCountryTemplate} itemTemplate={this.countryOptionTemplate} />
                </div>
            );
        } else if (field == 'expiryDate') {
            return (
                <input type="date" style={{ width: '100%' }} value={props.node.data.expiryDate} data-date-format="DD MMMM YYYY"
                    onChange={(e) => this.onEditorValueChange(props, e.target.value)}
                />
            );
        } else if (field == 'ticketNo') {
            return (
                <Input type="text" value={props.node.data ? props.node.data.ticketNo : ''}
                    onChange={(e) => this.onEditorValueChange(props, e.target.value)}
                />
            );
        }
    }

    selectedCountryTemplate(option, props) {
        if (option) {
            return (
                <div className="country-item country-item-value" style={{ marginTop: '-5px' }}>
                    <div style={{
                        width: ' 20px',
                        height: ' 20px',
                        border: '1px solid black',
                        boxSizing: 'border-box',
                        backgroundColor: option.name,
                        position: 'absolute',
                        marginTop: '4px'
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

    countryOptionTemplate(option) {
        return (
            <div style={{ marginTop: '-5px' }}>
                <div style={{
                    width: ' 20px',
                    height: ' 20px',
                    border: '1px solid black',
                    boxSizing: 'border-box',
                    backgroundColor: option.name,
                    position: 'absolute',
                    marginTop: '7px'
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

    addFolder() {
        if (this.state.selectedwebsite && this.state.selectedlanguage) {
            var data: CannedMessageWithExpiry = {
                websiteId: this.state.selectedwebsite!.websiteId, // TODO Put here Current DropDown WebsiteID,
                messageID: this.state.maxMessageId as any + 1,
                messageText: '',
                parentId: -1,
                languageId: this.state.selectedlanguage!.languageId, // TODO Put here Current DropDown LanguageID ,
                color: 'White',
                sortBy: this.state.maxSort as any + 1,
                expiryDate: '',
                ticketNo: ''
            }
            var node: TreeNode = {
                children: [],
                key: data.messageID.toString(),
                data: data
            };
            let newNodes: TreeNode[] = JSON.parse(JSON.stringify(this.state.nodes));
            newNodes.push(node)
            this.setState({ nodes: newNodes, maxMessageId: this.state.maxMessageId as any + 1 });
            let array = this.mapArray(newNodes)
            this.setState({ count: array.length })
            if (this.state.disabled) {
                this.setState({ disabled: false })
            }
        }
    }

    toggleApplications = (key) => {
        let _expandedKeys = { ...this.state.expandedKeys };
        if (_expandedKeys[key])
            delete _expandedKeys[key];
        else
            _expandedKeys[key] = true;
        this.setState({ expandedKeys: _expandedKeys });
    }
    colorTemplate = (node) => {
        if (node.data.color) {
            return <div className="country-item country-item-value" style={{ marginTop: '-5px' }}>
                <div style={{
                    width: ' 20px',
                    height: ' 20px',
                    border: '1px solid black',
                    boxSizing: 'border-box',
                    backgroundColor: node.data.color,
                    position: 'absolute',
                    marginTop: '4px'
                }}></div>
                <div style={{ marginLeft: '30px' }}>{node.data.color}</div>
            </div>
        }
    }
    dateTemplate = (node) => {
        if (node.data.expiryDate) {
            return <div>{moment(node.data.expiryDate).format('MM/DD/YYYY').toString()}

            </div>
        }
        else {
            return <div><input type="date" style={{ width: '100%' }} value={node.data.expiryDate} data-date-format="DD MMMM YYYY"
            /></div>
        }
    }

    messageTemplate = (node) => {
        if (node.data.messageText) {
            return <span style={{ width: '30%', display: 'inline' }}>{node.data.messageText}</span>
        }
        else {
            return <Input type="text" placeholder='Write Here' style={{ width: '30%', display: 'inline' }} value={node.data ? node.data.messageText : ''} />
        }
    }

    exportExcell = () => {
        if (this.state.nodes.length > 0) {
            this.setState({ export: true })
        }
        setTimeout(() => {
            this.setState({ export: false })
        }, 3000);
    }

    getHeader(globalFilterKey) {
        return (
            <div className="p-text-right">
                <div className="p-input-icon-left">
                    <i className="pi pi-search"></i>
                    <InputText type="search" onInput={(e) => this.setState({ globalFilter:e.currentTarget.value})} placeholder="Search" size={50} />
                </div>
            </div>
        );
    }

    ChildsArray = (childs) => {
        let childsArray = [] as any
        childs.map((item) => {
            let obj = {
                ...item.data,
                id: item.data.messageID,
                employees: this.ChildsArray(item.children)
            }
            childsArray.push(obj)
        })
        return childsArray;
    }
    makeArray = (nodes) => {
        let myArray = [] as any;
        nodes.map((item) => {
            let obj = {
                ...item.data,
                id: item.data.messageID,
                employees: item.children.length > 0 ? this.ChildsArray(item.children) : []
            }
            myArray.push(obj)
        })
        return myArray;
    }

    fileHandler = (event) => {
        let fileObj = event.files[0];
        ExcelRenderer(fileObj, (err, resp) => {
            if (err) {
                console.log(err);
            }
            else {
                let finalArray = [] as any
                var array = resp.rows.map(function (x) {
                    return {
                        ...x
                    };
                });
                for (let index = 1; index < array.length; index++) {
                    console.log(array[index], 'array of index')
                    let arrayofObj = Object.values(array[index])
                    console.log(arrayofObj, 'array of obj')
                    let expiryDate = arrayofObj[2]
                    if (expiryDate === '') {
                        console.log(arrayofObj, ' expiry date making to null')
                        expiryDate = null
                    }
                    console.log(arrayofObj, ' expiry date null')
                    let obj = {
                        color: arrayofObj[1],
                        expiryDate: arrayofObj[2],
                        languageId: arrayofObj[6],
                        messageID: arrayofObj[5],
                        messageText: arrayofObj[0],
                        parentId: arrayofObj[4],
                        sortBy: arrayofObj[7],
                        ticketNo: arrayofObj[3],
                        webSiteId: arrayofObj[8]
                    }
                    console.log(obj, ' obj')
                    finalArray.push(obj as any)
                }
                console.log(finalArray, 'final array')
                this.converTotree(finalArray as any)
            }
        });
        this.setState({ displayBasic: false })
    }

    converTotree = (data: CannedMessageWithExpiry[]) => {
        if (data.length > 0) {
            var max = _.maxBy(data, item => item.messageID);
            this.setState({ maxMessageId: max!.messageID, loader: true });
            let data1 = data.filter((item) => {
                if (item.expiryDate) {
                    let formatr = moment(item.expiryDate).format('MM/DD/YYYY').toString()
                    item.expiryDate = formatr
                    return item
                } else { return item }
            })
            console.log(data, ' data for tree')
            var nodes = this.transformToTree(data);
            console.log(nodes, 'nodes')
            this.setState({ nodes: nodes, loader: false, disabled: false });
        } else { this.setState({ loader: false, nodes: [] }) }
    }

    handleClose = (visible) => {
        this.setState({ confirmation: visible })
    }

    handleCloseSnackbar = (visible) => {
        this.setState({ openSnackBar: visible })
    }

    handleExportClose = (e)=>{
        this.setState({export:e})
    }
    
    render() {
        let header = this.getHeader('globalFilter');
        return (
            <Fragment>
                <div className='confirm_dialog'>
                    <Dialog header="Confirmation" breakpoints={{ '560px': '75vw' }} style={{ width: '30%' }} visible={this.state.displayBasic} footer={this.renderFooter('displayBasic')} onHide={() => this.onHide()}>
                        <p>Do you want to override existing canned messages?</p>
                    </Dialog>
                </div>
                <div className="row home-resources d-none d-md-block"><div className="col-12"><h6><a href="/">Home</a><span> / CannedResponses</span></h6></div></div>
                <div className="row d-md-flex d-none"><div className="col-md-6 resources-heading"><h1>Canned Responses</h1></div></div>
                <div className="dropdown-demo">
                    <Row style={{ display: 'flex' }}>
                        <Col className='dropdown-style' xs={12} sm={12} md={10} lg={6}>
                            <div className="dropdown-textbox">
                                <Label className='fontbold'>Website</Label>
                                <div className='dropdowncss'>
                                    <Dropdown value={this.state.selectedwebsite} options={this.state.websites} onChange={(e) => this.onWebsiteChange(e)} optionLabel="domainName"
                                        filter filterMatchMode='contains' showClear className='websitedropdown' filterBy="domainName" placeholder="Select a Website" valueTemplate={this.selectedWebsiteTemplate} itemTemplate={this.websiteOptionTemplate} />
                                </div>
                            </div>
                            <div className="dropdown-textbox mt-2">
                                <Label className='fontbold'>Language</Label>
                                <Dropdown value={this.state.selectedlanguage} options={this.state.languages} onChange={(e) => this.onLanguageChange(e)} optionLabel="languageName"
                                    filter showClear className='languagedropdown' filterBy="languageName" placeholder="Select Language" valueTemplate={this.selectedLanguage} itemTemplate={this.languageOptionTemplate} />
                            </div>
                        </Col>
                        <Col xs={12} sm={12} md={10} lg={6}>
                            <Button className='loadmsg' style={{ backgroundColor: '#5579c8' }} onClick={() => { this.loadMessages() }}>Load Messages</Button>
                            {/* <br />
                            <input disabled={true} className='checkbox1' type="checkbox" />
                            <Label className='lockmsglbl'>Lock Messages</Label> */}
                        </Col>
                    </Row>
                    <Row className='btnrow'>
                        <Col xs={12} sm={12} md={12} lg={12} className='btn-toolbar'>
                            <Button className=' btnwidth' onClick={() => { this.addFolder() }}>Add Folder</Button>
                            <Button className=' btnwidth' onClick={() => this.onAddMessage()} >Add Message</Button>
                            <Button style={{ backgroundColor: '#5579c8' }} disabled={this.state.disabled} className=' btnwidth' onClick={() => { this.deleteRequest() }}>Delete</Button>
                            <Button style={{ backgroundColor: '#5579c8' }} disabled={this.state.disabled} className=' btnwidth' onClick={() => { this.saveRequest() }}>Save</Button>
                            {/* <span>
                                <input className='checkbox1' disabled={true} type="checkbox" />
                                <Label className='lockmsglbl'>Rearrange</Label>
                            </span> */}
                            <Button style={{ backgroundColor: '#5579c8' }} label="Show" icon="pi pi-external-link" onClick={() => this.onClick()} className='btnleft sleft btnwidth'>Import Messages
                            </Button>
                            <Button style={{ backgroundColor: '#5579c8' }} className='btnwidth' onClick={() => { this.exportExcell() }}>Export Messages</Button>
                            {/* <Button style={{backgroundColor:'#5579c8'}} disabled={true} className='btnleft'>Refresh Greeters'</Button> */}
                        </Col>
                    </Row>
                    <div className="card table-css">
                        <TreeTable value={this.state.nodes}
                            selectionMode="single"
                            scrollable scrollHeight="400px"
                            loading={this.state.loader}
                            expandedKeys={this.state.expandedKeys}
                            onToggle={e => this.setState({ expandedKeys: e.value })}
                            selectionKeys={this.state.selectedItem as any}
                            onSelect={e => this.setState({ selectedItem: e.node })}
                            globalFilter={this.state.globalFilter}
                            header={header}
                        >
                            <Column field="messageText" body={this.messageTemplate} editor={this.sizeEditor} header="Message Text" expander={true}></Column>
                            <Column field="color" className='colorwidth' body={this.colorTemplate} editor={this.sizeEditor} header="Color"></Column>
                            <Column field={"expiryDate"} body={this.dateTemplate} className='expirtywidth' editor={this.sizeEditor} header="Expiry Date"></Column>
                            <Column field="ticketNo" className='tktwidth' editor={this.sizeEditor} header="Ticket No"></Column>
                        </TreeTable>
                    </div>
                     <div className='divcount2'>
                        <Label className='lblcount2'>Count = {this.state.count}</Label>
                    </div>
                </div>
                <SnackBar open={this.state.openSnackBar} severity={this.state.severity} message={this.state.message} handleClose={(e) =>this.handleCloseSnackbar(e)} />
                <ConfirmDialogDemo visible={this.state.confirmation} differentiate={this.state.differentiate} header={this.state.header} message={this.state.confirmationMessage} handleClose={(e) => this.handleClose(e)} handleAccept={(e, mode) => this.handleAccept(e, mode)} />
                {this.state.export && <ExportData data={this.makeArray(this.state.nodes)} handleExportClose={(e)=>{this.handleExportClose(e)}} />}
            </Fragment>
        );
    }


}

export default Canned;