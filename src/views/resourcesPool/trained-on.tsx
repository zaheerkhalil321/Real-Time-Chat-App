import React, { useState, useRef, Component, Fragment, useEffect, useCallback } from "react";
import { Link,useHistory } from 'react-router-dom';
import {LoginResponse,RoleInterface, EmployeCompanyWebMDL,WebsiteStatus,UserTrainingInfo, SaveUserTrainedOn } from '../../models/index';
import { wglcsApiService } from '../../services/WglcsApiService'
import './resource.css';
import './trainedOnAassign.css';
import "../../assets/GlobalStyle.css";
import SnackBar from "../alert/SnackBar";
import _, { isEmpty, isNull } from "lodash";
import { DataTable } from 'primereact/datatable';
import {Column} from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Dropdown } from 'primereact/dropdown';



const TrainedOn = (props, ResourcesPoolComponentState) => {
  const history = useHistory();
  const [globalFilter, setGlobalFilter] = useState(null);
  const [loading, setloading] = useState(true);
  const [userTrainingInfo, setuserTrainingInfo] = useState([] as any);
  const [status, setStatus] = useState(null);
  const [statusData, setStatusData] = useState([] as any);
  const [websitesData, setwebsitesData] = useState([] as any);
  const [selectedWebsitesData, setSelectedWebsitesData] = useState([] as any);
  
  const [userTrainedOnToUpdate, setuserTrainedOnToUpdate] = useState([] as any);
  const [selectedRowData, setSelectedRowData] = useState([]);
  const [selectedUser, setSelectedUser] = useState([]);
  const [value, setValue] = React.useState([]);
  const [inputValue, setInputValue] = React.useState([]);

  const [selected, setSelected] = React.useState<string[]>([]); 
  const [random, setRandom] = useState(0);
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [openSnackBar, setOpenSnackBar] = React.useState(false);
  const [severity, setSeverity] = React.useState("");
  const [responseMsg, setResponseMsg] = React.useState("");

  const Defaultcolumns = [
    {field: 'websiteId', header: ' Websites'},      
    {field: 'status', header: 'Status'},
  ];
  const [selectedColumns, setSelectedColumns] = useState(Defaultcolumns);


  const websiteBodyTemplate=(option)=>{  
   let selectedValue=websitesData?.filter(x=>x.websiteId===option.websiteId)
    return(
      <select className="form-control" onChange={(e) => handleSelectedWebsite(e, option)} style={{ width: "90%" }}>
        {websitesData?.map((dt) => {
          if (dt.websiteId === option.websiteId) {
            return (<option selected value={dt.websiteId}>{dt.domainName}</option>)
          }
          else {
            return (<option value={dt.websiteId}>{dt.domainName}</option>)
          }
        })}
      </select>
  )}


  const statusBodyTemplate=(option)=>{
   
    return(
        <select className="form-control" onChange={(e) => handleSelectedWebsiteStatus(e, option)} style={{ width: "auto",float:"right" }}>
        {statusData?.map((dt) => {
          if (dt.value == option.status) {
            return (<option selected value={dt.value}>{dt.label}</option>)
          }
          else {
            return (<option value={dt.value}>{dt.label}</option>)
          }
        })}
      </select>
      
      // <Dropdown className="form-control dropdown-box" style={{float:"right",width:"auto" }} 
      //  options={statusData}  
      //  onChange={(e) => handleSelectedWebsiteStatus(e,option)} optionLabel="label" /> 
  )}


  const columnComponents = selectedColumns.map(col=> {     
    if(col.field=="websiteId"){
      return <Column key={col.field} sortable body={websiteBodyTemplate} field={col.field} header={col.header} />;      
    }        
    if(col.field=="status"){
      return <Column key={col.field} sortable style={{textAlign: 'right'}} body={statusBodyTemplate} field={col.field} header={col.header} />;      
    }
    return <Column key={col.field}   field={col.field} header={col.header} />;            
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
      setSelectedUser(props.location?.state?.selectedData)
      getValue(props.location?.state?.selectedData)
    }
  }, [])

  const getValue = (value) => {
    setSelectedRowData(value)
    setUserId(value?.userId)
    setFName(value?.employeeFname)
    setLName(value.employeeLname)
    setUserName(value.userName)
    if(isNull(value.imagePath)){
      setUserImage("")
    }
    else{
      setUserImage(value.imagePath)
    }
    ServiceCalls()
  }

  useEffect(() => {
  }, [random])


  const ServiceCalls = async () => {
    setloading(true)
    var response: UserTrainingInfo[] = [];
    var responseStatusApi: WebsiteStatus[] = [];
    var responseWebsiteApi: EmployeCompanyWebMDL[] = [];
    var RoleInterface: RoleInterface[] = [];

    let UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse);

    response =(await wglcsApiService.getusertraninginfobyuserid(props.location?.state?.selectedData?.userId)).data!.data;
    responseStatusApi = (await wglcsApiService.getallstatuses()).data!.data;

    RoleInterface =(await wglcsApiService.getroleinterfaces()).data!.data;
    var found = RoleInterface.some(el => el.interfaceName === "service only");
    if (found) {
      responseWebsiteApi =(await wglcsApiService.getwebsitesbyempcompany_serviceonly(UserData?.userLoginData?.empCompId)).data!.data;
    }
    else {
      responseWebsiteApi = (await wglcsApiService.getwebsitesbyempCompany(UserData?.userLoginData?.empCompId)).data!.data;;
    }
    var temp = convertToCustom(responseStatusApi);
    setwebsitesData(responseWebsiteApi)
    setuserTrainingInfo(response);
    setStatusData(temp);
    setloading(false)
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


  const handleSelectedWebsite = (e, data) => {
    var Filtered = [];
    if (userTrainedOnToUpdate.length != 0) {
      Filtered = userTrainedOnToUpdate.filter((x) => x.opTrainedId === data.trainedId);
    }

    if (userTrainedOnToUpdate.length == 0) {
      AddObjectInArray(e.value, data);
    }
    else if (Filtered.length > 0) {
      let preArray = userTrainedOnToUpdate;
      let objIndex = preArray.findIndex((obj => obj.opTrainedId == data.trainedId));
      preArray[objIndex].websiteId = e.websiteId;
      setuserTrainedOnToUpdate(preArray)
      setRandom(Math.random())
    }
    else {
      AddObjectInArray(e.websiteId, data);
    }
  }

  const AddObjectInArray = (websiteId, data) => {
    var obj = {
      opTrainedId: data.trainedId,
      websiteId: parseInt(websiteId),
      userId: userId,
      opTrainedRating: data.rating,
      statusId: parseInt(data.status),
      languageId: null,
      status: null,
      userDepartments: "",
    }
    setuserTrainedOnToUpdate(userTrainedOnToUpdate.concat(obj))
    setRandom(Math.random())
  }



  const handleSelectedWebsiteStatus = (e, data) => {
    var Filtered = [];
    if (userTrainedOnToUpdate.length != 0) {
      Filtered = userTrainedOnToUpdate.filter((x) => x.opTrainedId === data.trainedId);
    }

    if (userTrainedOnToUpdate.length == 0) {
      AddObjectInArrayForStatus(e.target.value, data);
      setRandom(Math.random())
    }
    else if (Filtered.length > 0) {
      let preArray = userTrainedOnToUpdate;
      let objIndex = preArray.findIndex((obj => obj.opTrainedId == data.trainedId));
      preArray[objIndex].statusId = e.target.value;
      setuserTrainedOnToUpdate(preArray)
    }
    else {
      AddObjectInArrayForStatus(e.target.value, data);
    }
  }


  const AddObjectInArrayForStatus = (statusId, data) => {
    var obj = {
      opTrainedId: data.trainedId,
      websiteId: parseInt(data.websiteId),
      userId: userId,
      opTrainedRating: data.rating,
      statusId: parseInt(statusId),
      languageId: null,
      status: null,
      userDepartments: "",
    }
    setuserTrainedOnToUpdate(userTrainedOnToUpdate.concat(obj))
    setRandom(Math.random())
  }


  const handleUpdateUserTrainedOn = async () => {

    if (userTrainedOnToUpdate.length > 0) {
      setloading(true)

      const body = {
        deleteUserTrainedOnById: [],
        deleteUserTrainedOnByUserId: [],
        deleteUserTrainedOnByWebsiteId: [],
        userTrainedOnToAdd: [],
        userTrainedOnToUpdate: userTrainedOnToUpdate
      };

      var res = await wglcsApiService.saveusertrainedon(body);
      if (res?.data?.status == true) {
        var response = await wglcsApiService.getusertraninginfobyuserid(userId);
        setuserTrainingInfo(response?.data?.data);
        
        setSeverity("info")
        setResponseMsg("Operation Successfully completed")
        setOpenSnackBar(true);       
      }
      else {        
        setSeverity("error")
        setResponseMsg("Error")
        setOpenSnackBar(true);
      }
      setloading(false)
      Clear()
    }
    else {      
      setSeverity("warn")
      setResponseMsg("Change atleast one record") 
      setOpenSnackBar(true);
      setTimeout(() => {
        setOpenSnackBar(false)
      }, 3000);
    }
  }

  const Clear = () => {
    setuserTrainedOnToUpdate([])    
    setTimeout(() => {
      setOpenSnackBar(false)
    }, 3000);
  }

  const handleDeleteTrainedWebsite = () => {
    const body = {
      deleteUserTrainedOnById: selected,
      deleteUserTrainedOnByUserId: [],
      deleteUserTrainedOnByWebsiteId: [],
      userTrainedOnToAdd: [],
      userTrainedOnToUpdate: []
    };
  }

  const handlePushHistory = () => {
    history.push({
      pathname: '/resources/trained-on-assign',
      state: { selectedData: selectedUser}
    })
  }

  const Back = () => {
    history.push({
      pathname: '/resourcesPool',     
    })  
  }

 
  return (

    <div className="resources-container">

      <div className="row home-resources d-none d-md-block">
        <div className="col-12">
          <h6><Link to="/">Home</Link><span> / <Link to="/resourcesPool">Resources</Link></span><span> / Trained On</span></h6>
        </div>
      </div>
      <div className="row d-md-none d-block">
        <div className="col-md-6 text-center resource-manager">
          {/* <h1><Link to="/resourcesPool"><i className="fa fa-chevron-left"></i></Link>Resource Manager<span onClick={handlePushHistory} style={{cursor:"pointer"}}><i className="fa fa-plus-circle"></i></span></h1> */}
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 pt-2 pt-md-0 resources-heading trainer-content">
          {!isEmpty(userImage)?(<span className="user-name-1"><img src={userImage} /></span>):(
            <span className="trainer-name">
            {fName != "" ? (
              fName[0].toUpperCase()
            ) : (
              null
            )}

            {lName != "" ? (
              lName[0].toUpperCase()
            ) : (
              null
            )}
            </span>
          )}
         
          <ul>
            <li><h1>{userName}</h1></li>
            <li><span className="team-name">{fName}</span><span className="pudoname">{lName}</span></li>
          </ul>
        </div>
        <div className="col-md-6 text-right add-resources hide-on-mobile">
          <h1 style={{cursor:"pointer"}} onClick={handlePushHistory}><i className="fa fa-plus-circle"></i>Assign Website</h1>
        </div>
      </div>
      <div className="row hide-on-desk">
        <div className="col-5  resources-heading">
          <h1>Trained on</h1>
        </div>
        <div className="col-7 text-right add-resources">
          <h1 onClick={handlePushHistory}><i className="fa fa-plus-circle"></i>Assign Website</h1>
        </div>
      </div>
      

      <div className="card trained-on-table">         
        {loading===true?(<div className="spinner-div"><ProgressSpinner style={{width: '70px', height: '70px',backgroungColor:"red"}} strokeWidth="3" fill="#EEEEEE" animationDuration=".5s"/></div>
          ):(                   
            userTrainingInfo?.length===0?(
             <div className="spinner-div">
              <img src={process.env.PUBLIC_URL + '/css/resources-images/empty.png'} style={{height:"80px",width:"100px",}} /><br/>
              <span>Data Not Found</span>
            </div>):(
            <>
              <DataTable 
                rowHover paginator rows={25}            
                // selectionMode="single" selection={selectedRow} onSelectionChange={(e)=>handleSelectedRow(e.value)}
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" 
                rowsPerPageOptions={[25,50,70,100]}                           
                resizableColumns 
                columnResizeMode="expand"                               
                value={userTrainingInfo}
                header={header}                   
                className="p-datatable-lg p-datatable-responsive-demo">
                {columnComponents }
            </DataTable>

            <div className="row">
              <div className="col-12">
                <div className="form-group back-save" style={{ float: "right",marginTop:"10px"  }} >
                  <button className="back" onClick={(e) => { Back() }}>Back</button>
                  <button className="save-btn" style={{ marginLeft: "10px" }} onClick={handleUpdateUserTrainedOn}>Save</button>
                </div>
              </div>
            </div>
          </>
          )           
        )}
        <SnackBar open={openSnackBar} severity={severity} message={responseMsg}/>
        </div>
      </div>  
  );
}
export default TrainedOn;
