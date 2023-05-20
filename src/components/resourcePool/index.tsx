import { DataTable } from 'primereact/datatable';
import React, { useState, useEffect, useRef, createRef } from "react";
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import _, { isEmpty, isNull } from "lodash";
import './ResourcePool.css';
import "../../assets/GlobalStyle.css";
import { Button } from 'primereact/button';
import { useHistory } from 'react-router-dom';
import { Checkbox } from 'primereact/checkbox';
import { ProgressSpinner } from 'primereact/progressspinner';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Link } from 'react-router-dom';
import { Menu } from 'primereact/menu';
import { ScrollPanel } from 'primereact/scrollpanel';
import { AllResourcesData } from '../../models/index';
import Confirmation from '../../views/alert/ConfirmationDialog';
import { wglcsApiService } from '../../services/WglcsApiService'
import SnackBar from "../../views/alert/SnackBar";
import { InputSwitch } from 'primereact/inputswitch';


const ResourcePool = (props) => {
  const [loading, setloading] = useState(true);
  const [selectedRow, setSelectedRow] = useState([] as any);
  const [selectedStatus, setSelectedStatus] = useState(true);
  const [allResources, setAllResources] = useState([] as any);
  const [maintainState, setMaintainState] = useState("3453");
  const [isDisabledColumnMenu, setIsDisabledColumnMenu] = useState(false);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [severity, setSeverity] = React.useState("");
  const [responseMsg, setResponseMsg] = React.useState("");
  const [statusToggle, setStatusToggle] = React.useState(false);
  const [selectedStatusForChange, setSelectedStatusForChange] = useState(false);

  const history = useHistory();
  const op = useRef(null as any);
  const currentRow = useRef(null as any);
  const menu = useRef(null as any);


  useEffect(() => {
    setAllResources(props.allResources)
  }, [props.allResources])


  const columns = [
    { field: 'userName', header: 'Username', isChecked: true },
    { field: 'roleName', header: 'Role Name', isChecked: true },
    { field: 'companyName', header: 'Company', isChecked: true },
    { field: 'languageName', header: 'Language', isChecked: true },
    { field: 'employeeEmail', header: 'Email', isChecked: true },
    { field: 'status', header: 'Status', isChecked: true },
    { field: 'alottedBreak', header: 'Alotted Break', isChecked: false },
    { field: 'companyId', header: 'Company Id', isChecked: false },
    { field: 'employeeFname', header: 'First Name', isChecked: false },
    { field: 'employeeLname', header: 'Last Name', isChecked: false },
    { field: 'employeePhone', header: 'PhoneNo', isChecked: false },
    { field: 'roleId', header: 'Role Id', isChecked: false },
    { field: 'userId', header: 'User Id', isChecked: false },
    { field: 'userNoOfChats', header: 'UserChats', isChecked: false },
    { field: 'userPassword', header: 'Password', isChecked: false },
    { field: 'Actions', header: 'Actions', isChecked: true },
  ];
  const [selectedColumns, setSelectedColumns] = useState(columns);
  const [defaultColumns, setDefaultColumns] = useState(columns);

  const mobileViewColumns = [
    { field: 'userName', header: 'Username', isChecked: true },
    { field: 'roleName', header: 'Role Name', isChecked: true },
    { field: 'companyName', header: 'Company', isChecked: true },
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
    console.log("refresh")
  }, [maintainState])

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





  const header = (
    <div className="table-header">
      <div className="p-grid ">
        <div className="p-sm-10 p-md-10 p-lg-10 p-xl-10">
          {/* <MultiSelect value={selectedColumns} options={columns} optionLabel="header" onChange={onColumnToggle} style={{width:'10em'}}/>   */}

        </div>
      </div>
    </div>
  );


  const NameBodyTemplate = (value) => {
    var userName = "";
    var isImage = false;
    if(isNull(value.imagePath) || isEmpty(value.imagePath)){
      if (value?.employeeFname != "") {
        userName = value?.employeeFname[0].toUpperCase()
      }

      if (value?.employeeLname != "") {
        userName += value.employeeLname[0].toUpperCase()
      }  
    }  
    else{
      userName = value.imagePath;
      isImage = true
     }
   


      return (
        <React.Fragment>
          <span className="user-name" hidden={isDisabledColumnMenu}> 
            {isImage==true?(
              <><img src={userName} /></>
            ):(
            <>{userName}</> 
            )}             
          </span>
          <span className="complete-user-name"> {value.userName} </span>
        </React.Fragment  >
      );
   
    const handleMenu=(e,value)=>{      
      setSelectedRow(value)
      menu.current.toggle(e)
    }


    return (
      <React.Fragment>
        <span className="user-name">
          {isImage === true ? (
            <><img src={userName} /></>
          ) : (
            <>{userName}</>
          )}
        </span>
        <span className="complete-user-name"> {value.userName} </span>
      </React.Fragment  >
    );
  }
  const handleMenu = (e, value) => {
    setSelectedRow(value)
    menu.current.toggle(e)
  }


  const EditBodyTemplate = (value) => {
    return (
      <React.Fragment>
        <span className="icon-dots"> <img src={process.env.PUBLIC_URL + '/css/resources-images/icon-dots.svg'} onClick={(e) => handleMenu(e, value)} /></span>
      </React.Fragment>
    );
  }

  const StatusBodyTemplate = (value) => {
    return <>{value.status === true ? ("Enable") :
      ("Disable")} </>
  }



  const handleEditRow = (value) => {
    history.push({
      pathname: '/resources/personal-information',
      state: { selectedData: value ?? [] }
    })
  }


  const handleSelectedRow = (value) => {
    history.push({
      pathname: '/resources/trained-on',
      state: { selectedData: value ?? [] }
    })
  }

  const handleFilterByStatus = (e) => {
    setStatusToggle(e.target.checked);
    var filtered = props.allResources?.filter(f => f.status == e.target.checked)
    setAllResources(filtered)
  }

  const handleFilterStatus = (e) => {
    setSelectedStatus(e.value);
    var filtered = props.allResources?.filter(f => f.status == e.value)
    setAllResources(filtered)
  }

  const handlOpenConfirmationDialog = (e, selectedRow) => {
    setSelectedStatusForChange(selectedRow.status)
    setOpenConfirmationDialog(true)
  }

  const handleEditStatus = async (response, mode) => {


    if (response) {
      var status = false;
      if (selectedStatusForChange) { status = false }
      else { status=true; }

      const body = {
        userId: selectedRow.userId,
        status: status,
      }
      var res = await wglcsApiService.setuserstatus(body);

      if (res?.data?.status == true) {
        props.handleReset()
        setSeverity("info")
        setResponseMsg("Operation successfully completed")
        setOpenSnackBar(true);
             
      }
      else {
        setSeverity("error")
        setResponseMsg("Error")
        setOpenSnackBar(true);
      }
    }
    setOpenConfirmationDialog(false)
    setSelectedRow([])
    setTimeout(() => {
      setOpenSnackBar(false);
    }, 3000);
  }


  const columnHeader = (Title: string) => {
    if (!isDisabledColumnMenu) {
      return <>
        <img className="icon-columns" src={process.env.PUBLIC_URL +'/css/resources-images/icon-columns.svg'} onClick={(e) => op.current.toggle(e)} />
      </>
    }
  }



  const statusFilter = <InputSwitch className="status-input" checked={selectedStatus} onChange={handleFilterStatus} />

  const columnComponents = selectedColumns.map(col => {
    if (col.isChecked) {
      if (col.field == "userName") {
        return <Column key={col.field} sortable filter filterMatchMode="contains" filterPlaceholder="Search" body={NameBodyTemplate} field={col.field} header={col.header} />;
      }
      if (col.field == "employeeEmail") {
        return <Column key={col.field} sortable filter filterMatchMode="contains" filterPlaceholder="Search" field={col.field} header={col.header} />;
      }
      if (col.field == "Actions") {
        return <Column key={col.field} body={EditBodyTemplate} style={{ textAlign: 'right' }} field={col.field} header={columnHeader(col.header)} />;
      }
      if (col.field == "status") {
        return <Column key={col.field} style={{ textAlign: 'center' }} sortable filter filterElement={statusFilter} body={StatusBodyTemplate} field={col.field} header={col.header} />;
      }
      return <Column key={col.field} sortable filter filterField={col.field} filterMatchMode="contains" filterPlaceholder="Search" field={col.field} header={col.header} />;
    }
  });


  return (
    <div className="card resource-data-table">
      <OverlayPanel ref={op} dismissable>
        <div className="fiter-role switch-btn" >
          <h1>Column Chooser</h1>
          <div className="form-group">
            <h2>Change Status</h2>
            <label className="switch">
              <input type="checkbox" defaultChecked={statusToggle} onChange={e => handleFilterByStatus(e)} />
              <span className="slider round"></span>
            </label>
          </div>
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
      </OverlayPanel>

      <div className="menu-box">
        <OverlayPanel ref={menu} dismissable>
          <div className="edit-content">
            <p className="ActionMenu" onClick={() => handleEditRow(selectedRow)}>Edit</p>
            <p className="ActionMenu" onClick={() => handleSelectedRow(selectedRow)}>Assign Website</p>
            <p className="ActionMenu" onClick={(e) => handlOpenConfirmationDialog(e, selectedRow)}>{selectedRow.status === true ? ("Disable") : ("Enable")}</p>
          </div>
        </OverlayPanel>
      </div>
      {props.loading == true ? (<div className="resourceTBL-spinner-div"><ProgressSpinner style={{ height: "50px", width: "50px", backgroungColor: "red" }} strokeWidth="3" fill="#EEEEEE" animationDuration=".5s" /></div>) : (
        allResources?.length === 0 ? (
          <div className="resourceTBL-spinner-div">
            <img src={process.env.PUBLIC_URL + '/css/resources-images/empty.png'} style={{ height: "80px", width: "100px", }} /><br />
            <span>Data Not Found</span>
          </div>) : (

          <DataTable
            rowHover paginator rows={25}
            // selectionMode="single" selection={selectedRow} onSelectionChange={(e)=>handleSelectedRow(e.value)}
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
            rowsPerPageOptions={[25, 50, 70, 100]}
            resizableColumns
            columnResizeMode="expand"
            value={allResources}
            header={header}
            className="p-datatable-lg p-datatable-responsive-demo">
            {columnComponents}
          </DataTable>
        )
      )}
      <Confirmation Open={openConfirmationDialog} ConfirmationResponse={(e, mode) => { handleEditStatus(e, mode) }} ConfirmationMode={"ChangeStatus"} message={"Are you sure you want to change status?"} />
      <SnackBar open={openSnackBar} severity={severity} message={responseMsg} />
    </div>
  );
}
export default ResourcePool
