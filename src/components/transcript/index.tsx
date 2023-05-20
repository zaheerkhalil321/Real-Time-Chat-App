import React, { Component } from "react";
import 'primeflex/primeflex.css';
import "react-datetime/css/react-datetime.css";
import { Node } from 'react-checkbox-tree';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import DataTable from "./DataTable";
import { wglcsApiService } from '../../services/WglcsApiService'
import _ from "lodash";
import { RoleInterface, LoginResponse, ChatTranscriptData, EmployeCompanyWebMDL } from '../../models/index';
import "./ChatTranscript.css"
import moment from 'moment';
import OverLayPanel from "./OverLayPanel";
import { Link } from 'react-router-dom';
import "../../assets/GlobalStyle.css";

interface ChatTranscriptComponentState {
   loading: boolean,
   treeDataLoading: boolean,
   fromDate: Date,
   fromDateError: boolean,
   fromDateErrorText: string,
   toDate: Date,
   toDateError: boolean,
   checkedAllCompanies: boolean,
   selectedAllWebsites: [],
   selectedAgents: [],
   agentsData: [],
   employeeWebsitesData: [],
   chatTranscript: [],
   treeData: [],
   nodes: Node[],
   checked: string[],
   expanded: string[],
   selectedWebsites: [],
   employeeCompanyId: string,
   ViewAllChatsInterface: boolean,
   webIds: []
}


class index extends Component<{}, ChatTranscriptComponentState> {
   constructor(props) {
      super(props);
      var fDate = moment(new Date()).format('YYYY-MM-DD');
      var tDate = moment(new Date()).format('YYYY-MM-DD');

      this.state = {
         loading: false,
         treeDataLoading: true,
         fromDate: new Date(),
         fromDateError: false,
         fromDateErrorText: "",
         toDate: new Date(),
         toDateError: false,
         checkedAllCompanies: false,
         chatTranscript: [],
         selectedAgents: [],
         agentsData: [] as any,
         employeeWebsitesData: [],
         treeData: [],
         nodes: [],
         checked: [],
         expanded: [],
         selectedWebsites: [],
         employeeCompanyId: "",
         ViewAllChatsInterface: false,
         selectedAllWebsites: [],
         webIds: []
      };
   }
   op = React.createRef()

   componentDidMount() {
      console.log(this.state.fromDate)
      this.ServiceCalls();
   }

   handleFromDate = date => {    
      var fDate = moment(date.value).format('YYYY-MM-DD');
      console.log(fDate)
      this.setState({
         fromDate:fDate as any,
         fromDateError: false,
      });
   };


   handleToDate = date => {
      var fDate = moment(date.value).format('YYYY-MM-DD');

      this.setState({
         toDate: fDate as any,
         toDateError: false,
      });
   };


   handleCompaniesCheckBox = (event) => {
      this.setState({ checked: event })
   }


   removeValidator = () => {
      this.setState({
         fromDateError: false,
         fromDateErrorText: "",
      });
   }

   Validator = () => {
      let isError = false;
      if (this.state.fromDate == null) {
         this.setState({
            fromDateError: true,
         });
         return true;
      }
      else if (this.state.toDate == null) {
         this.setState({
            toDateError: true,
         });
         return true;
      }
      return isError;
   }


   ServiceCalls = async () => {

      this.setState({
         loading: true
      });

      var RoleInterface: RoleInterface[] = [];
      var chatTranscriptRes: ChatTranscriptData[] = [];

      var UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse);
      this.setState({ employeeCompanyId: UserData?.userLoginData?.empCompId })

      RoleInterface = (await wglcsApiService.getroleinterfaces()).data!.data;
      let interfaceResponse = RoleInterface.some(el => el.interfaceName === "View All Chats");
      this.setState({ViewAllChatsInterface: interfaceResponse,})
      
      if (UserData?.userLoginData?.empCompId == "01") {
         if (interfaceResponse) {
            await this.websitesApiCall(UserData?.userLoginData?.empCompId.toString())
            await this.usersApiCall(UserData?.userLoginData?.empCompId.toString())
         }
         else {
            await this.websitesApiCall(UserData?.userLoginData?.empCompId.toString())
         }
      }
      else {
         // if (!interfaceResponse) {
         //    await this.websitesApiCall(UserData?.userLoginData?.empCompId.toString())
         // }
      }   


      this.setState({
         loading: false,
         selectedAgents: [UserData?.userLoginData?.userId],
      } as any);
   }

   usersApiCall = async (companyId) => {
      var response = await wglcsApiService.getenableusersbycompany(companyId);
      this.setState({
         agentsData: response?.data?.data,
      } as ChatTranscriptComponentState)
   }

   websitesApiCall = async (companyId) => {
      var employeeComWebRes: EmployeCompanyWebMDL[] = [];
      employeeComWebRes = (await wglcsApiService.getwebsitesbyempCompany(companyId)).data!.data;

      var nodes = this.transformToTree(employeeComWebRes);
      var uniqueWebArray = this.removeDuplicates(nodes, "key");
      this.setState({
         webIds: this.getwebsiteIds(employeeComWebRes),
         treeData: _.orderBy(uniqueWebArray, ['title'], ['asc']),
         loading: false
      } as ChatTranscriptComponentState);
   }

   getwebsiteIds = (data) => {
      var array = [] as any
      data.forEach(element => {
         array.push(element.websiteId.toString())
      });
      return array;
   }


   removeDuplicates(originalArray, prop) {
      var newArray = [] as any;
      var lookupObject = {};

      for (var i in originalArray) {
         lookupObject[originalArray[i][prop]] = originalArray[i];
      }

      for (i in lookupObject) {
         newArray.push(lookupObject[i]);
      }
      return newArray;
   }


   transformToTree(data: EmployeCompanyWebMDL[]) {
      // var filtered=_.chain(data).filter((f: EmployeCompanyWebMDL) => f.websiteId !==0);
      var nodes = data.map(item => this.fromArrayToTreeNode(item)).valueOf();
      this.fillTreeRecursive(nodes as any, data)
      return nodes;
   }


   fromArrayToTreeNode(item: EmployeCompanyWebMDL) {
      return { title: item.companyName ?? item['companyName'], data: { label: item.companyName ?? item['companyName'] }, Id: item.companyId, key: item.companyId + ":" + item.companyName + ":Parent" ?? item['companyId'], children: [] } as any;
   }


   fillTreeRecursive(nodes: Node[], data: EmployeCompanyWebMDL[]) {
      for (let index = 0; index < nodes.length; index++) {
         const element = nodes[index] as any;
         element.children = data.filter((f: EmployeCompanyWebMDL) => f.companyId == (element as any).Id)
            .map(item => this.fromArrayToChildTreeNode(item)).valueOf();
         //this.fillTreeRecursive(element.children, data);
      }
   }

   fromArrayToChildTreeNode(item: EmployeCompanyWebMDL) {
      return { title: item.domainName ?? item['domainName'], data: { label: item.domainName ?? item['domainName'] }, Id: item.websiteId, key: item.websiteId + ":" + item.domainName + ":Child" ?? item['websiteId'], children: [] } as any;
   }


   filterData = async () => {
      var chatTranscriptResponse = [] as any;
      var checkError = this.removeValidator();
      this.setState({ loading: true });

      let UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse);

      if (this.state.employeeCompanyId === "01") {
         if (this.state.ViewAllChatsInterface) {
            var toD = moment(this.state.toDate).add(1, 'days')
            var time = "12:00 AM";
            var frD = moment(this.state.fromDate + ' ' + time).toDate();

            var params = {
               fromdate: frD,
               todate: toD,
               strUsers: this.state.selectedAgents.join(),
               strWebsites: this.state.selectedWebsites
            }
            chatTranscriptResponse = await wglcsApiService.GetChatTranscriptsWithQCAgent(params)
         }
         else {
            var tDD = moment(this.state.toDate).add(1, 'days')
            var time = "12:00 AM";
            var fTD = moment(this.state.fromDate + ' ' + time).toDate();

            var _body = {
               strUserIds: UserData?.userLoginData?.userId.toString(),
               fromdate: fTD,
               todate: tDD,
               strWebsites: this.state.webIds.join()
            }
            chatTranscriptResponse = await wglcsApiService.GetChatTranscripts(_body)
         }
      }
      else {
         if (this.state.ViewAllChatsInterface) {
            var toDtime = moment(this.state.toDate).add(1, 'days')
            var time = "12:00 AM";
            var fDtime = moment(this.state.fromDate + ' ' + time).toDate();
            var body = {
               fromdate: fDtime,
               todate: toDtime,
               userID: UserData?.userLoginData?.userId,
               status: "M",
               empCompId: UserData?.userLoginData?.empCompId
            }
            chatTranscriptResponse = await wglcsApiService.GetChatInfo(body)
         }
         else {  
            var ddd = moment(this.state.toDate).add(1, 'days')
            var time = "12:00 AM";
            chatTranscriptResponse = await wglcsApiService.getuserinterectedchattranscripts(this.state.fromDate, moment(ddd).format('YYYY-MM-DD'), UserData?.userLoginData?.userId)
         }

      }
      this.setState({
         chatTranscript: chatTranscriptResponse?.data?.data || [],
         loading: false,
      })
   }

   arrayToString = () => {
      let strings = [] as any;
      Object.entries(this.state.selectedWebsites).forEach(element => {
         strings.push(element[0])
      });
      return strings.join()
   }

   handleSelectedWebsite = (selectedWeb) => {
      this.setState({ selectedWebsites: selectedWeb })
   }

   Clear = () => {
      let UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse);

      var fDate = moment(new Date()).format('YYYY-MM-DD');
      var tDate = moment(new Date()).format('YYYY-MM-DD');

      this.setState({
         fromDate: fDate as any,
         fromDateError: false,
         fromDateErrorText: "",

         toDate: tDate as any,
         toDateError: false,

         selectedAgents: UserData?.userLoginData?.userId as any,
         selectedWebsites: [],
      })

      this.filterData()
   }

   render() {
      return (
         <div className="resources-container">
            <div className="row home-resourcess">
               <div className="col-12">
                  <h6><Link to="/">Home</Link><span> / ChatTranscripts</span></h6>
               </div>
            </div>


            <div className="row">
               <div className="col-md-6 resources-heading">
                  <h1>Chat Transcripts</h1>
               </div>
            </div>

            <div className="chatTranscript-container">
               <div className="row pt-2">
                  <div className="col-md-3 py-2">
                     {/* <label htmlFor="basic">From Date</label><br />
                     <input className="p-inputtext" type="date" placeholder="From Date" data-date="" data-date-format="MM-DD-YYYY" value={this.state.fromDate as any} onChange={(e) => this.handleFromDate(e)} />
                     {this.state.fromDateError ? <span style={{ color: "red" }}>* Required</span> : ""} */}

                     <label htmlFor="firstname6">From Date</label>
                    <Calendar showIcon  value={this.state.fromDate}
                     onChange={this.handleFromDate}/>              
                  </div>

                  <div className="col-md-3 py-2">
                     <label htmlFor="basic">To Date</label><br />
                     <Calendar  id="abc" showIcon   value={this.state.toDate} onChange={this.handleToDate}/>  

                     {/* <label htmlFor="lastname6" style={{marginLeft:"1.8%"}}>To Date</label>
                  <Calendar className="p-sm-12 p-md-12 p-lg-12 p-xl-12"  value={this.state.toDate} onChange={this.handleToDate}/>        
                  {this.state.toDateError?  <span style={{color:"red"}}>* Required</span> : "" } */}
                  </div>


                  {this.state.employeeCompanyId === "01" ? (
                     this.state.ViewAllChatsInterface === true ? (
                        <>
                           <div className="col-md-3 py-2">
                              <label htmlFor="basic">Select User</label>
                              <MultiSelect value={this.state.selectedAgents} optionLabel="userName" options={this.state.agentsData} onChange={(e) => this.setState({ selectedAgents: e.value })} optionValue="userId" placeholder="Select Users" filter className="multiselect-custom" />
                           </div>

                           <div className="col-md-3 py-2">
                              <label htmlFor="basic">Select Websites</label>
                              <OverLayPanel nodes={this.state.treeData} getSelectedWebsite={e => this.setState({ selectedWebsites: e })} />
                           </div>
                        </>
                     ) : ("")

                  ) : (
                     this.state.ViewAllChatsInterface === true ? (
                        ""
                     ) : (""
                        // <div className="p-field p-col-12 p-md-6">
                        //    {/* <label htmlFor="basic">Select Websites</label><br/> */}
                        //    <OverLayPanel nodes={this.state.treeData} getSelectedWebsite={(e, value) => this.setState({ selectedWebsites: e, selectedAllWebsites: value })} />
                        // </div>
                     )
                  )}



                  <div className="col-12  text-right" >
                     <Button className="search-btn" disabled={this.state.loading} onClick={this.filterData}>Search</Button>
                     {/* <Button className="clear-btn" disabled={this.state.loading} onClick={(e)=>{this.Clear()}}>Clear</Button> */}
                  </div>

               </div>
               <div className="row">
                  <div className="col-12 pt-2">
                     <DataTable loading={this.state.loading} chatTranscript={this.state.chatTranscript} />
                  </div>
               </div>
            </div>


         </div>

      );
   }
}
export default index;
