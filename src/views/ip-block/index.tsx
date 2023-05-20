import React, { } from "react";
import { Dropdown } from 'primereact/dropdown';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { AllBlockedIps, LoginResponse } from "../../models";
import { wglcsApiService } from '../../services/WglcsApiService'
import './ip-block.css';
import { DataTable } from "primereact/datatable";
import { InputText } from 'primereact/inputtext';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import "../../assets/GlobalStyle.css"
import SnackBar from "./../alert/SnackBar";
import ConfirmationDialog from "./../alert/ConfirmationDialog";


interface IpBlockState {
    allBlockedIps: _.Dictionary<AllBlockedIps[]>,
    blockedIps: [],
    selectedWebsite: any | null;
    selectedName: any | null;
    expandedRows: any;
    products1: AllBlockedIps[];
    saveInfo: AllBlockedIps[];
    rows: any | null;
    username: any;
    array: any | null;
    value: string,
    loading: boolean,
    isBtnDisabled: boolean,
    openSnackBar: boolean,
    severity: string,
    responseMsg: string,
    openConfirmationDialog: boolean,
    ConfirmationMessage: string,
    ConfirmationMode: string,
    RowForDelete: number,
}

class IPBlock extends React.Component<{}, IpBlockState> {

    dt: DataTable | null = null;
    id: any;

    constructor(props) {
        super(props);
        this.id = _.uniqueId();

        this.state = {
            allBlockedIps: {},
            selectedWebsite: null,
            selectedName: null,
            expandedRows: null,
            products1: [],
            saveInfo: [],
            rows: [],
            username: [],
            array: [],
            blockedIps: [{ id: 0, temp: "temp" }] as any,
            value: '',
            loading: true,
            isBtnDisabled: true,
            openSnackBar: false,
            severity: "",
            responseMsg: "",
            openConfirmationDialog: false,
            ConfirmationMessage: "",
            ConfirmationMode: "",
            RowForDelete: 0
        }

        this.onDropDownChange = this.onDropDownChange.bind(this);
        this.filterDate = this.filterDate.bind(this);
    }

    saveDataToApi = () => {
        let array: any[] = [];
        let newArray: any[] = [];
        array = this.state.saveInfo;
        array.forEach(item => {
            if (item.ipAddress) {
                newArray.push(item.ipAddress)
            }
        })

        let data = {
            websiteId: this.state.selectedWebsite,
            ipAddress: newArray,
        }
        wglcsApiService.saveBlockedIps(data);
    }
    appendChild = (event) => {


        let array: any[] = [];
        array = this.state.saveInfo;

        array.push({
            id: _.uniqueId(),
            'domainName': this.state.saveInfo[0]?.domainName ?? 'temp',
            'ipAddress': event,
            'websiteId': this.state?.saveInfo[0]?.websiteId ?? '123'
        })
        array.concat(
            <tr>
                <td><i className="fa fa-pencil"></i></td>
                <td><input value={this.state.value} onChange={(e) => this.setState({ value: e.target.value })} onKeyPress={this.handleKeyPress} type="text" className="ip-field" /></td>
            </tr>
        );
        this.setState({ saveInfo: array, value: '' })


    }

    handleKeyPress = (event) => {
        let check = false;
        if (event.key === 'Enter') {
            var ipformat = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

            if (event.target.value.match(ipformat)) {

                this.state.saveInfo.forEach(item => {
                    if (item.ipAddress === event.target.value)
                        check = true;

                });

                if (!check) {
                    this.appendChild(event.target.value);
                    //this.setState({ value: '' })

                } else {
                    this.setState({ severity: "warn", responseMsg: "IP Address is Duplicate.", openSnackBar: true })
                    setTimeout(() => {
                        check = false
                        this.setState({ value: '', severity: "", responseMsg: "", openSnackBar: false })
                    }, 3000);
                }

            }
            else {
                this.setState({ severity: "warn", responseMsg: "IP Address is not Valid.", openSnackBar: true })
                setTimeout(() => {
                    check = false
                    this.setState({ value: '', severity: "", responseMsg: "", openSnackBar: false })
                }, 3000);
            }
        }
    }


    handleSave = async (e) => {
        this.setState({ openConfirmationDialog: true, ConfirmationMessage: "Are you sure you want to save the information?", ConfirmationMode: "Save" })
    }


    handleDelete = (e) => {
        this.setState({ RowForDelete: e.id })
        this.setState({ openConfirmationDialog: true, ConfirmationMessage: "Are you sure you want to delete the information?", ConfirmationMode: "Delete" })
    }


    handleConfirmationResponse = (e, Mode) => {
        if (e === true && Mode === "Delete") {
            const data = this.state.saveInfo.filter(m => m.id != this.state.RowForDelete)
            this.setState({ saveInfo: data })
        }
        else if (e === true && Mode === "Save") {
            this.saveInformations()
        }
        else {
            this.setState({ value: '' })
        }
        this.setState({
            openConfirmationDialog: false,
            ConfirmationMessage: "",
            ConfirmationMode: ""
        })

    }


    saveInformations = async () => {
        this.saveDataToApi()
        let result = await wglcsApiService.getallblockedips();
        let grouped = _.groupBy(result?.data?.data, d => d.domainName);
        this.setState({ allBlockedIps: grouped });
        if (result?.data?.status) {
            this.setState({ severity: "info", responseMsg: "Operation successfully completed", openSnackBar: true })
            setTimeout(() => {
                this.setState({ severity: "", responseMsg: "", openSnackBar: false })
            }, 3000);
        }
        else {
            this.setState({ severity: "error", responseMsg: "Operation is not successfully completed", openSnackBar: true })
            setTimeout(() => {
                this.setState({ severity: "", responseMsg: "", openSnackBar: false })
            }, 3000);
        }
    }

    componentDidMount = async () => {
        this.setState({
            loading: true
        })

        let result = await wglcsApiService.getallblockedips();
        let grouped = _.groupBy(result?.data?.data, d => d.domainName);
        this.setState({ allBlockedIps: grouped });

        var customArray = [] as any;
        Object.keys(grouped).forEach(element => {
            var obj = {
                domainName: element
            }
            customArray.push(obj)
        });

        this.setState({
            blockedIps: customArray,
            loading: false
        });
    }

    filterDate(value, filter) {
        if (filter === undefined || filter === null || (typeof filter === 'string' && filter.trim() === '')) {
            return true;
        }

        if (value === undefined || value === null) {
            return false;
        }

        return value === filter;
    }

    onDropDownChange(event: any) {
        const selectId = this.state.allBlockedIps[event.value?.domainName];
        this.setState({ saveInfo: selectId, isBtnDisabled: false });
        this.setState({ selectedWebsite: selectId[0].websiteId });
        this.setState({ selectedName: selectId[0].domainName });
        this.dt?.filter(event.value?.domainName, 'domainName', 'custom');
    }

    onEditorValueChange(productKey, props, value) {
        let updatedProducts = [...props.value];
        updatedProducts[props.rowIndex][props.field] = value;
        this.setState({ products1: updatedProducts });

    }

    inputTextEditor(productKey, props, field) {
        return <InputText type="text" value={props.rowData[field]} />;
    }

    codeEditor(productKey, props) {
        return this.inputTextEditor(productKey, props, 'code');
    }


    WebsiteOptionTemplate = (option) => {
        if (this.state.loading) {
            return (
                <div className="spinner-div"><i className="pi pi-spin pi-spinner" ></i></div>
            )
        }
        if (option) {
            return (
                <div className="country-item">
                    <div>{option.domainName}</div>
                </div>
            );
        }
    }



    render() {
        const id = this.id
        return (

            <div className="ip-container">
                <div className="row home-resources d-none d-md-block"><div className="col-12"><h6><a href="/">Home</a><span> / IPBlock</span></h6></div></div>
                <div className="row d-md-flex d-none"><div className="col-md-6 resources-heading"><h1>IP Block</h1></div></div>
                <div className="ip-box">

                    <div className="padding-box">
                        <Dropdown
                            filter filterBy="domainName" filterMatchMode="contains"
                            value={this.state.selectedWebsite}
                            options={this.state.blockedIps}
                            itemTemplate={this.WebsiteOptionTemplate}
                            onChange={this.onDropDownChange}
                            showClear
                            placeholder={this.state.selectedWebsite == null ? "Select a website" : this.state.selectedName}
                        />
                    </div>
                    <div className="ip-inner-box" hidden={this.state.isBtnDisabled}>
                        <div className="HeaderDiv"> <span style={{ fontSize: "14px", fontWeight: "bold", color: "rgba(73,80,87,.62)" }} className="ip-address">IP addresses</span> </div>
                        <div className="table-div">
                            <table className="ipblock-table">
                                {this.state.saveInfo.map(item => (<tr >
                                    {!_.isEmpty(item.ipAddress) && <>
                                        <td>{item.ipAddress}<i onClick={() => this.handleDelete(item)} className="delete fa fa-trash"></i></td></>}
                                </tr>
                                ))}
                                {this.state.selectedWebsite && (
                                    <tr>
                                        <td><input value={this.state.value} onChange={(e) => this.setState({ value: e.target.value })} onKeyPress={this.handleKeyPress} id="demo" className="ip-field ipInput" /></td>
                                    </tr>
                                )}
                            </table>
                        </div>
                    </div>

                    <div className="ip-Block">
                        <Link className="clear-btn" hidden={this.state.isBtnDisabled} to='/ip-block'>Reset</Link>
                        <button className="search-btn" hidden={this.state.isBtnDisabled} onClick={(e) => this.handleSave(e)} >Save</button>
                    </div>
                </div>
                <SnackBar open={this.state.openSnackBar} severity={this.state.severity} message={this.state.responseMsg} />
                <ConfirmationDialog Open={this.state.openConfirmationDialog} ConfirmationResponse={(e, Mode) => this.handleConfirmationResponse(e, Mode)} onHide={e=>this.setState({openConfirmationDialog:false})} message={this.state.ConfirmationMessage} ConfirmationMode={this.state.ConfirmationMode} />
            </div>
        );
    }
}

export default IPBlock;