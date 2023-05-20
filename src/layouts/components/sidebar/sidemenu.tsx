import React, { Component, lazy } from "react";

import {
   Home,
   Mail,
   Users,
   Link,
   WifiOff
} from "react-feather";
import { Modal, ModalBody, ModalHeader, ModalFooter, Button } from 'reactstrap'
import { NavLink } from "react-router-dom";
import { hybridPanelLink, agentPanelLink, LoginResponse } from '../../../models/index';
import 'react-confirm-alert/src/react-confirm-alert.css';
// Styling
import "../../../assets/scss/components/sidebar/sidemenu/sidemenu.scss";

import SideMenu from "./sidemenuHelper";
import * as _ from 'lodash';

const LazyTranscript = lazy(() => import('../../../views/transcript/chatTranscript'));
const LazyResourcesPool = lazy(() => import('../../../views/resourcesPool/index'));
const LazyViewReport = lazy(() => import('../../../components/report/index'));
const LazyChat = lazy(() => import('../../../components/chat/ChatComponent'));
const LazyCannedPage = lazy(() => import('../../../views/canned/canned'));
const LazyPersonalCannedPage = lazy(() => import('../../../views/personalcanned/personalcanned'));
const LazyPushContentPage = lazy(()=> import('../../../views/pushcontent/pushcontent'));
const LazyIPBlock = lazy(() => import('../../../views/ip-block'));

export const OperatorPanelRoute = "/chat";

interface SideMenuContentState {
   switch: boolean,
   linkCheck: boolean,
   showModal: boolean,
   path: string,
   nextPath: string,
   currentUser: LoginResponse | null | undefined
}

interface props {
   toggleSidebarMenu: any,
   location: any,
   history: any
}

interface Route {
   path: string,
   title: string,
   interfaceName: string,
   image: string | null,
   icon: JSX.Element | null,
   component: React.LazyExoticComponent<any>,
   componentProps: object
}


export const routes: Route[] = [
   { title: 'Dashboard', path: '/', image: null, icon: <Home size={18} />, interfaceName: 'Chat Reporting', component: LazyViewReport, componentProps: {} },
   { title: 'Agent Panel', path: OperatorPanelRoute, image: '/css/navbar/agent panel-white.svg', icon: null, interfaceName: '', component: LazyChat, componentProps: {hybridChat: false} },
   { title: 'Hybrid Panel', path: '/hybridChat', image: '/css/navbar/hybred panel.svg', icon: null, interfaceName: '', component: LazyChat, componentProps: {hybridChat: true} },
   { title: 'Chat Transcripts', path: '/transcript', image: '/css/navbar/transcripts.svg', icon: null, interfaceName: 'Chat Transcripts', component: LazyTranscript, componentProps: {} },
   { title: 'Resource Pool', path: '/resourcesPool', image: null, icon: <Users size={18} />, interfaceName: "View All Resources", component: LazyResourcesPool, componentProps: {} },
   { title: 'IP Block', path: '/ip-block', image: null, icon: <WifiOff  size={18} />, interfaceName: 'IP Block', component: LazyIPBlock, componentProps: {} },
   { title: 'Canned Responses', path: '/canned', image: null, icon: <Mail size={18} />, interfaceName: 'Canned Messages', component: LazyCannedPage, componentProps: {} },
   { title: 'Personal Canned', path: '/pcanned', image: null, icon: <Mail size={18} />, interfaceName: 'Personal Canned Messages', component: LazyPersonalCannedPage, componentProps: {} },
   { title: 'Push Content', path: '/push_content', image: null, icon: <Link size={18} />, interfaceName: 'Push Pages', component: LazyPushContentPage, componentProps: {} },
]

class SideMenuContent extends Component<props, SideMenuContentState>{

   constructor(props) {

      super(props);

      this.state = {
         switch: false,
         linkCheck: false,
         showModal: false,
         path: '',
         nextPath: '',
         currentUser: (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse
      }
   }

   handleClick = (event, path) => {
      if (path != this.props.location.pathname) {
         event.preventDefault();
         if ((this.props.location.pathname == hybridPanelLink || this.props.location.pathname == agentPanelLink)) {
            this.setState({ showModal: true, path: this.props.location.pathname, nextPath: path })
         }
         else this.props.history.push(path)
      }
   }

   renderIcon(icon: JSX.Element) {
      return(
         <i className="menu-icon">
            {icon}
         </i>
      )
   }

   getUserPermittedRoutes = () => {
      return routes.filter(route => route.interfaceName == '' ||  _.some(this.state.currentUser?.interfaces, item => item.interfaceName.toLowerCase() == route.interfaceName.toLowerCase()));
   }

   render() {

      return (
         <>
            <div className="test">
               <SideMenu className="sidebar-content" toggleSidebarMenu={this.props.toggleSidebarMenu}>
                  {this.getUserPermittedRoutes().map((route) => {
                     return(
                        <SideMenu.MenuSingleItem>
                           <NavLink onContextMenu={e => e.preventDefault()} onClick={(event) => this.handleClick(event, route.path)} to={route.path} exact={true}>
                              {route.icon ? this.renderIcon(route.icon) : <img alt={route.title} src={process.env.PUBLIC_URL + route.image} />}
                              <span className="menu-item-text">{route.title}</span>
                           </NavLink>
                        </SideMenu.MenuSingleItem>
                     )
                  })}
               </SideMenu>
            </div>

            <div className="text-center">
               <Modal isOpen={this.state.showModal}>
                  <ModalHeader>Panel Change</ModalHeader>
                  <ModalBody>
                     {this.state.path === hybridPanelLink ? 'Are you sure you want to quit Hybrid Panel?.' : 'Are you sure you want to quit Agent Panel?'}
                  </ModalBody>
                  <ModalFooter>
                     <Button style={{ background: '#3874BA' }} onClick={() => { this.props.history.push(this.state.nextPath); this.setState({ showModal: false }) }}>
                        Yes
                     </Button>{" "}
                     <Button style={{ background: '#727B83' }} onClick={() => this.setState({ showModal: false })}>
                        No
                     </Button>
                  </ModalFooter>
               </Modal>
            </div>

         </>
      );
   }
}

export default SideMenuContent;
