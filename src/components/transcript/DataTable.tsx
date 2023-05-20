import { DataTable } from 'primereact/datatable';
import React, { useState, useEffect, useRef, createRef } from "react";
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { MultiSelect } from 'primereact/multiselect';
import { Dialog } from 'primereact/dialog';
import { Menu } from 'primereact/menu';
import _ from "lodash";
import "./ChatTranscript.css";
// import "./datatable.css";
import moment from 'moment';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { wglcsApiService } from '../../services/WglcsApiService'
import { RoleInterface, LoginResponse } from '../../models/index';
import { OverlayPanel } from 'primereact/overlaypanel';
import "../../assets/GlobalStyle.css";


const ChatTranscriptDataTable = (props) => {
    const [globalFilter, setGlobalFilter] = useState(null);
    const [resizableMode, setresizableMode] = useState("expand");
    const [loading, setloading] = useState(true);
    const [displayBasic, setDisplayBasic] = useState(false);
    const [selectedColumn, setselectedColumn] = useState("");
    const [chatTranscript, setChatTranscript] = useState([] as any);
    const [maintainState, setMaintainState] = useState("3453");
    const menu = useRef(null as any);
    const [isDisabledColumnMenu, setIsDisabledColumnMenu] = useState(false);

    useEffect(() => {
        setChatTranscript(props.chatTranscript)
    }, [props.chatTranscript])

    const items = [
        {
            label: 'Group',
            items: [
                {
                    label: 'Group By This Column',
                    icon: 'pi pi-tags',
                    style: { fontsize: "4em" },
                    command: () => { convertToGroupBy() }
                },
                {
                    label: 'Show Group Panel',
                    icon: 'pi pi-eye',
                    command: () => {
                        //toast.current.show({ severity: 'warn', summary: 'Delete', detail: 'Data Deleted', life: 3000 });
                    }
                }
            ]
        },
        {
            label: 'column ',
            items: [
                {
                    label: 'Best fit (all column)',
                    icon: 'pi pi-external-link',

                },
                {
                    label: 'Best fit',
                    icon: 'pi pi-upload',
                    command: (e) => {
                        window.location.hash = "/fileupload"
                    }
                }
            ]
        }
    ];

    const columns = [
        { field: 'visitorName', header: 'Visitor', isChecked: true },
        { field: 'userName', header: 'Name', isChecked: true },
        { field: 'domainName', header: 'Website', isChecked: true },
        { field: 'chatStartTime', header: 'Start Time', isChecked: true },
        { field: 'chatEndTime', header: 'End Time', isChecked: true },
        { field: 'emailStatus', header: 'Email Status', isChecked: true },
        { field: 'emailDate', header: 'Date', isChecked: false },
        { field: 'departmentName', header: 'Dpt. Name', isChecked: false },
        { field: 'qcAgents', header: 'QC Agents', isChecked: false },
        { field: 'CSAAgent', header: 'CSA Agent', isChecked: false },
        { field: 'ChatOrigin', header: 'Chat Origin', isChecked: false },
        { field: 'chatId', header: 'Chat Id', isChecked: false },
        { field: 'userId', header: 'User Id', isChecked: false },
        { field: 'visitorId', header: 'Visitor Id', isChecked: false },
        { field: 'websiteId', header: 'Website Id', isChecked: false },
        { field: 'Actions', header: 'Actions', isChecked: true },
    ];

    const [selectedColumns, setSelectedColumns] = useState(columns);
    const [defaultColumns, setDefaultColumns] = useState(columns);


    const mobileViewColumns = [
        { field: 'visitorName', header: 'Visitor', isChecked: true },
        { field: 'userName', header: 'Name', isChecked: true },
        { field: 'domainName', header: 'Website', isChecked: true },
        { field: 'Actions', header: 'Actions', isChecked: true },
    ];



    const handleWindowSizeChange = () => {
        if (window.innerWidth <= 768) {
            setSelectedColumns(mobileViewColumns);
            setDefaultColumns(mobileViewColumns);
            setIsDisabledColumnMenu(true)
        }
        else {
            setSelectedColumns(columns);
            setDefaultColumns(columns);
            setIsDisabledColumnMenu(false)
        }
    }
    window.onresize = handleWindowSizeChange;


    const onColumnToggle = (e, value) => {
        var PreviosArray = selectedColumns;
        var Filtered = selectedColumns.filter((x) => x.field === value.field)[0];
        var Index = selectedColumns.findIndex((item) => { return item.field === value.field; });

        if (e.target.checked) {
            Filtered.isChecked = true;
        }
        else {
            Filtered.isChecked = false;
        }
        PreviosArray[Index] = Filtered;
        setSelectedColumns(PreviosArray)
        setDefaultColumns(PreviosArray)
        setMaintainState(Math.random().toString() + Index)
    }

    useEffect(() => {
        if (window.innerWidth <= 768) {
            setSelectedColumns(mobileViewColumns);
            setDefaultColumns(mobileViewColumns);
            setIsDisabledColumnMenu(true)
        }
        else {
            setSelectedColumns(columns);
            setDefaultColumns(columns);
            setIsDisabledColumnMenu(false)
        }
    }, [loading])

    useEffect(() => {
        console.log("refresh")
    }, [maintainState])

    const handleMenu = (e) => {
        menu.current.toggle(e)
    }

    // const onColumnToggle = (event) => {
    //     let selectedColumns = event.value;
    //     let orderedSelectedColumns = columns.filter(col => selectedColumns.some(sCol => sCol.field === col.field));
    //     setSelectedColumns(orderedSelectedColumns);
    // }

    const filterData = (e) => {
        setGlobalFilter(e.target.value)
    }

    const convertToGroupBy = () => {
        // var result = _(TempData)
        //     .groupBy('VisitorName')
        //     .map(function(items, value) {           
        //     return {
        //         Parent: value,            
        //         children: items
        //     };
        //     }).value();
    }


    const header = (
        <div className="table-header">
            <div className="p-grid ">
                <div className="p-sm-10 p-md-10 p-lg-10 p-xl-10">
                    {/* <span className="p-input-icon-left">
                      <i className="pi pi-search" />
                      <InputText type="search" {...globalFilter} onInput={filterData} placeholder="Global Search"  style={{width:'20em'}} />
                    </span> */}
                </div>
                <div className="p-sm-2 p-md-2 p-lg-2 p-xl-2">
                    {/* <MultiSelect value={selectedColumns} options={columns} optionLabel="header" onChange={onColumnToggle} style={{ width: '10em' }} /> */}
                </div>
            </div>
        </div>
    );

    const columnHeader = (Title: string) => {
        return <>
            {/* <i className="pi pi-align-justify" onClick={() => onClick('displayBasic2','top',Title)} ></i> */}
            {Title}
        </>
    }


    const chatStartTimeBodyTemplate = (option) => {
        if (option) {
            return (
                <>
                    <div>{moment(option.chatStartTime).format('MM-DD-YYYY, h:mm a')}</div>
                </>
            );
        }
    }


    const chatEndTimeBodyTemplate = (option) => {
        if (option) {
            return (
                <>
                    <div>{moment(option.chatEndTime).format('MM-DD-YYYY, h:mm a')}</div>
                </>
            );
        }
    }

    const ActionBodyTemplate = (value) => {
        return (
            <React.Fragment>
                <Button className="p-button-secondary" tooltip="Email Form" tooltipOptions={{ className: 'teal-tooltip', position: 'top' }} onClick={() => handleSelectedRow(value)}>
                    <i className="pi pi-directions" style={{ 'fontSize': '1em' }}></i>
                </Button>
            </React.Fragment>
        );
    }


    const actionColumnHeader = (Title: string) => {
        if (!isDisabledColumnMenu) {
            return <>
                <img className="icon-columns" src="/css/resources-images/icon-columns.svg" onClick={(e) => menu.current.toggle(e)} />
            </>
        }
      
    }


    const columnComponents = selectedColumns.map(col => {
        if (col.isChecked) {
            if (col.field === "chatStartTime") {
                return <Column key={col.field} body={chatStartTimeBodyTemplate} sortable field={col.field} header={columnHeader(col.header)} />;
            }
            if (col.field === "chatEndTime") {
                return <Column key={col.field} body={chatEndTimeBodyTemplate} sortable field={col.field} header={columnHeader(col.header)} />;
            }
            if (col.field == "Actions") {
                return <Column key={col.field} body={ActionBodyTemplate} style={{ textAlign: 'right' }} field={col.field} header={actionColumnHeader(col.header)} />;
            }
            else {
                return <Column key={col.field} filter filterMatchMode="contains" filterPlaceholder="Search" sortable field={col.field} header={columnHeader(col.header)} />;
            }
        }
    });


    const handleSelectedRow = async (value) => {
        var RoleInterface: RoleInterface[] = [];
        var URL = value.visitorId + "&ChatId=" + value.chatId + "&WebsiteId=" + value.websiteId + "&UserId=" + value.userId + "&ChatStartTime=" + value.chatStartTime.toString("MM/dd/yy H:mm:ss");

        let UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse);

        if (UserData?.userLoginData?.empCompId === "01") {
            RoleInterface = (await wglcsApiService.getroleinterfaces()).data!.data;
            let interfaceResponse = RoleInterface.some(el => el.interfaceName === "Chat Transcripts With QC");
            if (interfaceResponse) {
                window.open("https://email.thelivechatsoftware.com/EmailForm/Emailform.aspx?VisitorId=" + URL)
            }
            else {
                window.open("https://email.thelivechatsoftware.com/EmailForm/default.aspx?VisitorId=" + URL)
            }
        }
        else {
            window.open("https://email.thelivechatsoftware.com/EmailFormClient/EmailFormClient.aspx?VisitorId=" + URL)
        }
    }



    const onClick = (name, position, title) => {
        setDisplayBasic(true)
        setselectedColumn(title)
    }

    const onHide = (name) => {
        setDisplayBasic(false)
    }


    return (
        <>
            <div className="card">
                {props.loading == true ? (<div className="spinner-div"><ProgressSpinner style={{ width: '70px', height: '70px', backgroungColor: "red" }} strokeWidth="3" fill="#EEEEEE" animationDuration=".5s" /></div>) : (
                    chatTranscript.length === 0 ? (
                        <div className="spinner-div">
                            <img src={process.env.PUBLIC_URL + '/css/resources-images/empty.png'} style={{ height: "80px", width: "100px", }} /><br />
                            <span>Data Not Found</span>
                        </div>) : (

                        <DataTable rowHover paginator rows={25}
                            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                            rowsPerPageOptions={[25, 35, 50, 100]}
                            globalFilter={globalFilter}
                            value={chatTranscript}
                            header={header}
                            className="p-datatable-lg p-datatable-responsive-demo">
                            {columnComponents}
                        </DataTable>
                    )
                )}
            </div>

            <Dialog header={selectedColumn} visible={displayBasic} style={{ width: '18vw', padding: '0px !important' }} onHide={() => onHide('displayPosition')} baseZIndex={1000}>
                <Menu model={items} style={{ width: "100%" }} />
            </Dialog>

            <OverlayPanel ref={menu} dismissable>
                <div className="fiter-role switch-btn" >
                    <h1>Column Chooser</h1>
                    <div className="column-chooser">
                        {defaultColumns.map(element => {
                            if (element.field !== "Actions") {
                                return (
                                    <div className="form-group">
                                        <h2>{element.header}</h2>
                                        <label className="switch">
                                            <input type="checkbox" defaultChecked={element.isChecked} onChange={e => onColumnToggle(e, element)} />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                )
                            }
                        })}
                    </div>
                </div>
            </OverlayPanel>
        </>
    );
}
export default ChatTranscriptDataTable
