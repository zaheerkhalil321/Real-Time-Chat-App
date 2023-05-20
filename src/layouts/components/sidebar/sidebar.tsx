// @ts-nocheck
import React, { Component, Fragment } from "react";
import classnames from "classnames";
import PerfectScrollbar from "react-perfect-scrollbar";

import "../../../assets/scss/components/sidebar/sidebar.scss";

import SideMenuContent from "./sidemenu";
import SidebarHeader from "./sidebarHeader";
import { FoldedContentConsumer } from "../../../utility/context/toggleContentContext";
import templateConfig from "../../../templateConfig";
import Customizer from '../../../components/customizer/customizer';
import { LoginResponse } from "../../../models";
import UnsentChatPopup from './../../../components/chat/unsentchatpopup/chat-popup';

interface props {
   toggleSidebarMenu: any,
   sidebarState: string,
   handleSidebarSize: (size: string) => void,
   handleLayout: (layout: string) => void,
   location: any,
   history: any
}

interface state {
   color: string,
   imgurl: string,
   collapsedSidebar: boolean,
   userData: LoginResponse,
   hasUnsentChats: boolean,
   width: any,
}

class Sidebar extends Component<props, state>  {
   constructor(props) {
      super(props);
      let userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse;
      this.state = {
         collapsedSidebar: templateConfig.sidebar.collapsed,
         width: window.innerWidth,
         userData: userData,
         hasUnsentChats: false,
         color: '',
         imgurl: ''
      };
   }

   updateWidth = () => {
      if (window.innerWidth <= 991) this.setState({ collapsedSidebar: false })

      else this.setState({ collapsedSidebar: true });
      this.setState(prevState => ({
         width: window.innerWidth
      }));
   };

   handleCollapsedSidebar = (collapsedSidebar: boolean) => {
      this.setState({ collapsedSidebar });
   }

   UnsentPopup = async () => {
      let userData = this.state.userData;
      for (const userInterface of userData.interfaces) {
         if (userInterface.interfaceName === "Supervisor Alert" && localStorage.getItem('unsentPopup') == 'true') {
            setInterval(this.unsentChatCondition, 500000);
         } else if (userInterface.interfaceName === "QA Alert") {
            setInterval(this.unsentChatCondition, 1000000);
         }
      }
   }
   unsentChatCondition = (e = true) => {
      this.setState({ hasUnsentChats: e })
   }
   componentDidMount() {
      this.UnsentPopup();
      if (window.innerWidth <= 991) this.setState({ collapsedSidebar: false })

      else this.setState({ collapsedSidebar: true });

      if (window) {
         window.addEventListener("resize", this.updateWidth, false);
      }



   }

   componentWillUnmount() {
      if (window) {
         window.removeEventListener("resize", this.updateWidth, false);
      }
   }
   handleMouseEnter = e => {
      this.setState(prevState => ({
         collapsedSidebar: false
      }));
   };

   handleMouseLeave = e => {
      this.setState(prevState => ({
         collapsedSidebar: true
      }));
   };

   sidebarBgColor = (color: string) => {
      this.setState({ color: color });
   }

   sidebarImageUrl = (color: string) => {
      this.setState({ color: color });
   }

   render() {
      return (
         <Fragment>
            {this.state.hasUnsentChats && <UnsentChatPopup unsentChatCondition={(e) => { this.unsentChatCondition(e) }} />}
            <FoldedContentConsumer>
               {context => (
                  <div
                     data-active-color="white"
                     data-background-color={(this.state.color === '') ? templateConfig.sidebar.backgroundColor : this.state.color}
                     className={classnames("app-sidebar", {
                        "": !this.state.collapsedSidebar,
                        collapsed: this.state.collapsedSidebar
                     },
                        {
                           "hide-sidebar": (this.state.width < 991 && this.props.sidebarState === "close"),
                           "": this.props.sidebarState === "open"
                        }
                     )}
                     onMouseEnter={(context as any).foldedContent ? this.handleMouseEnter : null}
                     onMouseLeave={(context as any).foldedContent && this.state.width > 991 ? this.handleMouseLeave : null}
                  >
                     <SidebarHeader toggleSidebarMenu={this.props.toggleSidebarMenu} sidebarBgColor={this.state.color} />
                     <PerfectScrollbar className="sidebar-content">
                        <SideMenuContent history={this.props.history} location={this.props.location} toggleSidebarMenu={this.props.toggleSidebarMenu} />
                     </PerfectScrollbar>

                     {/* {this.props.img === '' ? ( */}
                     {templateConfig.sidebar.backgroundImage ? (
                        (this.state.imgurl === '') ?
                           <div
                              className="sidebar-background"
                              style={{ backgroundImage: "url('" + templateConfig.sidebar.backgroundImageURL + "')" }}>
                           </div>
                           :
                           <div
                              className="sidebar-background"
                              style={{ backgroundImage: "url('" + this.state.imgurl + "')" }}>
                           </div>
                     ) :
                        (
                           (this.state.imgurl === '') ?
                              <div className="sidebar-background"></div>
                              :
                              <div
                                 className="sidebar-background"
                                 style={{ backgroundImage: "url('" + this.state.imgurl + "')" }}>
                              </div>
                        )
                     }
                  </div>
               )}
            </FoldedContentConsumer>
            <Customizer
               sidebarBgColor={this.sidebarBgColor}
               sidebarImageUrl={this.sidebarImageUrl}
               handleSidebarSize={this.props.handleSidebarSize}
               handleLayout={this.props.handleLayout}
               handleCollapsedSidebar={this.handleCollapsedSidebar.bind(this)}
            />
         </Fragment>
      );
   }
}

export default Sidebar;