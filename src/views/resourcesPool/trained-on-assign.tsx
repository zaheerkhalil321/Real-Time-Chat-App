import React, { useEffect, useState, Component, Fragment, useRef } from "react";
import { Link, useParams, useHistory } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import './resource.css';
import './trainedOnAassign.css';

import "../../assets/GlobalStyle.css";
import { LoginResponse, RoleInterface, EmployeCompanyWebMDL, WebsiteStatus, UserTrainingInfo, SaveUserTrainedOn } from '../../models/index';
import { wglcsApiService } from '../../services/WglcsApiService'
import { MultiSelect } from 'primereact/multiselect';
import { InputNumber } from 'primereact/inputnumber';
import SnackBar from "../alert/SnackBar";
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';



const TrainedOnAssign = (props) => {
  const history = useHistory();
  const [statusData, setStatusData] = useState([] as any);
  const [websitesData, setwebsitesData] = useState([] as any);
  const [userTrainedOnToAdd, setuserTrainedOnToAdd] = useState([] as any);
  const [userTrainingInfo, setuserTrainingInfo] = useState([] as any);
  const [loading, setloading] = useState(false);
  const [random, setRandom] = useState(0);
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [severity, setSeverity] = React.useState("");
  const [responseMsg, setResponseMsg] = React.useState("");
  const [selectedWebsite, setSelectedWebsite] = useState([] as any);
  const [selectedDomains, setSelectedDomains] = useState("");

  const WebdropDown = useRef(null as any);

  const Defaultcolumns = [
    { field: 'domainName', header: ' Websites' },
    // {field: 'rating', header: 'Rating'},      
    { field: 'status', header: 'Status' },
  ];
  const [selectedColumns, setSelectedColumns] = useState(Defaultcolumns);


  const statusBodyTemplate = (option) => {
    return (
      <select className="form-control" onChange={(e) => getStatus(e, option)} style={{ width: "auto", float: "right" }}>
        <option selected disabled >select Status</option>
        {statusData?.map((dt) => {
          if (dt.value == option.statusId) {
            return (<option selected value={dt.value}>{dt.label}</option>)
          }
          else {
            return (<option value={dt.value}>{dt.label}</option>)
          }
        })}
      </select>
    )
  }


  const ratingBodyTemplate = (option) => {
    return (
      <div className="Rating">
        <InputNumber value={option.rating as any} onValueChange={(e) => getRating(e.value, option)} mode="decimal" useGrouping={false} />
      </div>
    )
  }


  const columnComponents = selectedColumns.map(col => {
    if (col.field == "status") {
      return <Column key={col.field} sortable style={{ textAlign: 'right' }} body={statusBodyTemplate} field={col.field} header={col.header} />;
    }
    if (col.field == "rating") {
      return <Column key={col.field} body={ratingBodyTemplate} field={col.field} header={col.header} />;
    }
    return <Column key={col.field} sortable field={col.field} header={col.header} />;
  });


  const header = (
    <div className="table-header">
      <div className="p-grid ">
        <div className="p-sm-10 p-md-10 p-lg-10 p-xl-10">
          {/* <MultiSelect value={selectedColumns} options={columns} optionLabel="header" onChange={onColumnToggle} style={{width:'10em'}}/>                    */}
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (props.location?.state?.selectedData != undefined) {
      getValue(props.location?.state?.selectedData)
    }
    ServiceCalls()
  }, [])

  const getValue = (value) => {
    setUserId(value?.userId)
    setFName(value?.employeeFname)
    setLName(value.employeeLname)
    setUserName(value.userName)
  }


  const ServiceCalls = async () => {
    setloading(true)
    var response: UserTrainingInfo[] = [];
    var responseStatusApi: WebsiteStatus[] = [];
    var responseWebsiteApi: EmployeCompanyWebMDL[] = [];
    var RoleInterface: RoleInterface[] = [];

    let UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse);

    // response = (await wglcsApiService.getusertraninginfobyuserid(userId)).data!.data;
    responseStatusApi = (await wglcsApiService.getallstatuses())!.data!.data;
    // RoleInterface = (await wglcsApiService.getroleinterfaces()).data!.data;

    var found = RoleInterface.some(el => el.interfaceName === "service only");
    if (found) {
      responseWebsiteApi = (await wglcsApiService.getwebsitesbyempcompany_serviceonly(UserData?.userLoginData?.empCompId))!.data!.data;
    } else {
      responseWebsiteApi = (await wglcsApiService.getwebsitesbyempCompany(UserData?.userLoginData?.empCompId))!.data!.data;
    }

    const newArr = responseWebsiteApi?.map(v => ({ ...v, statusId: 0, rating: 0 }))
    setwebsitesData(newArr)
    // setuserTrainingInfo(response);
    setStatusData(convertToCustom(responseStatusApi));
    setloading(false);
  }


  const convertToCustom = (value) => {
    var tempArray = [] as any;
    value.forEach(element => {
      const obj = {
        label: element.status,
        value: element.statusId
      }
      tempArray.push(obj)
    });
    return tempArray
  }

  const arrayToString=()=>{
    var convertedArray = selectedWebsite.map((i) =>(i.domainName));
    if(convertedArray.length>3){setSelectedDomains(convertedArray.length +" item selected")}
    else{setSelectedDomains(convertedArray.join())} 
   }


  useEffect(() => {
    arrayToString()
  }, [selectedWebsite])


  useEffect(() => {
  }, [userTrainedOnToAdd])


  const bindStatusId = (values) => {
    for (let i = 0; i < values.length; i++) {
      values[i].statusId = statusData[0].value;
    }
    setSelectedWebsite(values);
  }


  const handleSelectedWebsites = (value) => {
    bindStatusId(value);
  }

  const getRating = (e, data) => {
    let preArray = selectedWebsite;
    let objIndex = preArray.findIndex((obj => obj.websiteId == data.websiteId));
    preArray[objIndex].rating = e;
    setSelectedWebsite(preArray);

  }

  const getStatus = (e, data) => {
    let preArray = selectedWebsite;
    let objIndex = preArray.findIndex((obj => obj.websiteId == data.websiteId));
    preArray[objIndex].statusId = e.target.value;
    setSelectedWebsite(preArray);
  }


  const AddObjectInArray = () => {
    let array = [] as any;
    selectedWebsite.forEach((value) => {
      var obj = {
        opTrainedId: 0,
        websiteId: parseInt(value.websiteId),
        userId: userId,
        opTrainedRating: value.rating.toString(),
        statusId: parseInt(value.statusId),
        languageId: null,
        status: null,
        userDepartments: "",
        websiteInfo: {}
      }
      array.push(obj)
    });
    return array
  }

  const handleAddUserTrainedOn = async () => {
    let array = AddObjectInArray()

    if (array.length > 0) {
      setloading(true)
      const body = {
        deleteUserTrainedOnById: [],
        deleteUserTrainedOnByUserId: [],
        deleteUserTrainedOnByWebsiteId: [],
        userTrainedOnToAdd: array,
        userTrainedOnToUpdate: [],
      };

      var res = await wglcsApiService.saveusertrainedon(body);

      if (res?.data?.status == true) {
        responseHandler("info", "Operation Successfully completed")
      }
      else {
        if (res?.data?.error[0]?.Code === "AP-2079-500") {
          responseHandler("warn", "One or more websites already assigned to user")
        }
        else {
          responseHandler("error", "Error")
        }
      }
    }
    else {
      responseHandler("warn", "Please select at least one website")
    }
  }

  const responseHandler = (severity: string, message: string) => {
    setSeverity(severity)
    setResponseMsg(message)
    setloading(false)
    setOpenSnackBar(true);
    setuserTrainedOnToAdd([])
    setSelectedWebsite([])
    setTimeout(() => {
      setOpenSnackBar(false)
    }, 3000);
  }


  const Back = () => {
    history.push({
      pathname: '/resources/trained-on',
      state: { selectedData: props.location?.state?.selectedData }
    })
  }

  const CloseSnackBar = () => {
    setOpenSnackBar(false)
  }


  const handleOverlay = (e) => {
    WebdropDown.current.toggle(e)
  }


  const panelFooterTemplate = (option) => {
    if (loading) {
      return (
        <>
          <div className="spinner-div"><ProgressSpinner style={{ width: '50px', height: '50px', backgroungColor: "red" }} strokeWidth="3" fill="#EEEEEE" animationDuration=".5s" /></div>
        </>
      )
    }
    if (option) {
      return (
        <p>{option.domainName}</p>
      );
    }
  }

  return (
    <div className="resources-container trained-on-table">


      <div className="row home-resources d-none d-md-block">
        <div className="col-12">
          <h6><Link to="/">Home</Link> / <Link to="/resourcesPool">Resources</Link> / <span onClick={(e) => { Back() }} style={{ color: "#5f697a", cursor: "pointer" }}>Trained On</span><span > / Trained On Assign</span></h6>
        </div>
      </div>
      <div className="row d-md-none d-block">
        <div className="col-md-6 text-center resource-manager">
          <h1><span onClick={(e) => { Back() }} style={{ cursor: "pointer" }}><i className="fa fa-chevron-left"></i></span>Resource Manager</h1>
        </div>
      </div>

      <div className="row ">
        <div className="col-md-6 py-2 py-md-0 resources-heading trainerContent">
          <h1>Assign Website to {userName}</h1>

        </div>
        <div className="col-md-6 text-right add-resources hide-on-mobile">
          {/* <h6><Link to="/">Home</Link><span> /<Link to="//resourcesPool">Resources</Link> / </span><span onClick={(e) => { Back() }} style={{color:"#1890ff",cursor: "pointer"}}>Trained On</span><span > / Trained On Assign</span></h6> */}

        </div>
      </div>
      <div className="resource-container">
        <div className="row">
          <div className="col-md-6 col-lg-6  left-search trained-left dataTable">
            <span></span>
            <div style={{ marginTop: "20px !important" }}>
              <span className="p-input-icon-right">
                <i className="pi pi-angle-down" onClick={(e) => handleOverlay(e)} />
                <InputText style={{ cursor: "pointer", width: "100%" }} placeholder="Select Websites" value={selectedDomains} onClick={(e) => handleOverlay(e)} />
              </span>
              {/* <MultiSelect maxSelectedLabels={1} style={{width:"100%"}} panelFooterTemplate={panelFooterTemplate} optionLabel="domainName" placeholder="Select Websites" filter filterBy="domainName" value={selectedWebsite} options={websitesData} onChange={(e) => handleSelectedWebsites(e.value)} />               */}
              <OverlayPanel ref={WebdropDown} id="overlay_panel" style={{ width: '450px' }} className="overlaypanel-demo website-box" dismissable>
                {loading === true ? (
                  <div className="spinner-div"><ProgressSpinner style={{ width: '50px', height: '50px', backgroungColor: "red" }} strokeWidth="3" fill="#EEEEEE" animationDuration=".5s" /></div>
                ) : (
                  <DataTable value={websitesData} sortMode="multiple" scrollable scrollHeight="200px" className="p-datatable-responsive-demo"
                    selectionMode="checkbox" selection={selectedWebsite} onSelectionChange={e => handleSelectedWebsites(e.value)}>
                    <Column selectionMode="multiple" headerStyle={{ width: '3em' }}></Column>
                    <Column field="domainName" sortable filter filterMatchMode="contains" header="Domain Name"></Column>
                    <Column field="industry" sortable filter filterMatchMode="contains" header="Industry"></Column>
                  </DataTable>
                )}

              </OverlayPanel>
            </div>
          </div>         
        </div>

        <div className="row">
          <div className="col-12 pt-3 dataTable trained-on-table">
            {selectedWebsite.length === 0 ? ("") : (
              <DataTable
                rowHover paginator rows={25}
                // selectionMode="single" selection={selectedRow} onSelectionChange={(e)=>handleSelectedRow(e.value)}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                rowsPerPageOptions={[25, 50, 70, 100]}
                resizableColumns
                columnResizeMode="expand"
                value={selectedWebsite}
                header={header}
                className="p-datatable-lg p-datatable-responsive-demo">
                {columnComponents}
              </DataTable>)}

          </div>
        </div>
        <div className="row">
          <div className="col-12">
            {selectedWebsite.length === 0 ? ("") : (
              <div className="form-group back-save" style={{ float: "right", marginTop: "10px" }} >
                <button className="back" onClick={(e) => { Back() }}>Back</button>
                <button className="save-btn" style={{ marginLeft: "10px" }} onClick={handleAddUserTrainedOn}>Save</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <SnackBar open={openSnackBar} severity={severity} message={responseMsg} />

    </div>
  );

}

export default TrainedOnAssign;
