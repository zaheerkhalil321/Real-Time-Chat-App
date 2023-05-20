import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { ToggleLeft, ToggleRight, X } from "react-feather";
import { FoldedContentConsumer } from "../../../utility/context/toggleContentContext";

interface SidebarHeaderProps {
   toggleSidebarMenu(string): any;
   sidebarBgColor: string;
}

class SidebarHeader extends Component<SidebarHeaderProps, {}> {
   handleClick = e => {
      this.props.toggleSidebarMenu("close");
   };

   render() {
      return (
         <FoldedContentConsumer>
            {context => (
               <div className="sidebar-header">
                  <div className="logo clearfix">
                     <NavLink to="/" className="logo-text float-left">
                     <span className="text align-middle">WG Live Chat</span>
                     </NavLink>
                     <span className="nav-toggle d-none d-sm-none d-md-none">
                        {(context as any).foldedContent ? (
                           <ToggleLeft onClick={(context as any).makeNormalContent} className="toggle-icon" size={16} />
                        ) : (
                           <ToggleRight onClick={(context as any).makeFullContent} className="toggle-icon" size={16} />
                        )}
                     </span>
                     <span className="nav-close d-block d-md-block d-lg-none d-xl-none" id="sidebarClose">
                        <X onClick={this.handleClick} size={20} />
                     </span>
                  </div>
               </div>
            )}
         </FoldedContentConsumer>
      );
   }
}

export default SidebarHeader;
