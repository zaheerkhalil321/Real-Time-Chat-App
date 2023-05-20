
import React, { Component, Fragment} from "react";
import { Link, Redirect } from 'react-router-dom';
import './resource.css';
import "../../assets/GlobalStyle.css";
import DataTable from "../../components/resourcePool/index";
import { AllResourcesData } from '../../models/index';
import { wglcsApiService } from '../../services/WglcsApiService'
import _ from "lodash";
import EventEmitter from '../../services/eventemitter';
import {Events} from '../../models/events';

interface ResourcesPoolComponentState {
   loading: boolean,
   allResources: []
   FilteredResources: [],
   showModal: boolean,
   file: string,
   imagePreviewUrl: string,   
}

class ResourcesPool extends Component<{}, ResourcesPoolComponentState> {

   constructor(props) {
      super(props);
      this.state = {
         showModal: false,
         loading: true,
         allResources: [],
         FilteredResources: [],
         file: '',
         imagePreviewUrl: '',
      } 
   }

   toggle = () => this.setState({ showModal: !this.state.showModal })

   componentDidMount() {
      this.ServiceCalls();
   }

   ServiceCalls = async () => {

      this.setState({
         loading: true
      });

      var response = [] as any;

      let UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)));
      response = await wglcsApiService.getusersbycompany_serviceonly(UserData?.userLoginData?.empCompId);
      console.log(response)
      this.setState({
         allResources: response?.data?.data,
         FilteredResources: response?.data?.data,
         loading: false
      } as ResourcesPoolComponentState);
   }

   handleReset=()=>{
      this.ServiceCalls();
   }

   FilterData = (e) => {
      var filterArray = this.state.allResources?.filter((f: AllResourcesData) => f.userName.toLowerCase()?.includes(e.target.value.toLowerCase()));
      this.setState({
         FilteredResources: filterArray,
      } as ResourcesPoolComponentState);
   }


   render() {
      return (
         <div className="resources-container">
            {/* <LoadImage/> */}
            <div className="row home-resources d-none d-md-block">
               <div className="col-12">
                  <h6><Link to="/">Home</Link><span> / Resources</span></h6>
               </div>
            </div>
            <div className="row d-md-none d-block">
               <div className="col-md-6 text-center resource-manager">
                  <h1>Resource Manager<Link to="/resources/personal-information"><i className="fa fa-plus-circle"></i></Link></h1>
               </div>
            </div>

            <div className="row d-md-flex d-none">              
               <div className="col-md-6 resources-heading">
                  <h1>Resources</h1>
               </div>
               <div className="col-md-6 text-right add-resources">
                  <h1><Link to="/resources/personal-information"><i className="fa fa-plus-circle"></i>Add Resource</Link></h1>
               </div>
            </div>

            <div className="resource-container">
               <div className="row pt-2">
                  <div className="col-md-6  left-search">
                     <input type="text" className="form-control" onChange={this.FilterData} placeholder="Search" />
                     <i className="fa fa-search"></i>
                  </div>
                  <div className="col-md-6 text-right right-search d-none d-md-block">
                  </div>
               </div>
               <div className="row">
                  <div className="col-12 pt-2">
                     <DataTable loading={this.state.loading} allResources={this.state.FilteredResources} handleReset={()=>this.handleReset()}/>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}
export default ResourcesPool;
