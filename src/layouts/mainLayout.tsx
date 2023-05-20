import React, { PureComponent } from "react";
import classnames from "classnames";

import { FoldedContentConsumer, FoldedContentProvider } from "../utility/context/toggleContentContext";
import Sidebar from "./components/sidebar/sidebar";
import Navbar from "./components/navbar/navbar";
import templateConfig from "../templateConfig";

interface MainLayoutProps {
   matchProps: any,
   location: any
}

class MainLayout extends PureComponent<MainLayoutProps, {}> {
   state = {
      width: window.innerWidth,
      sidebarState: "close",
      sidebarSize: '',
      layout: '',

   };

   updateWidth = () => {
      this.setState(prevState => ({
         width: window.innerWidth
      }));
   };

   handleSidebarSize = (sidebarSize) => {
      this.setState({ sidebarSize });
   }

   handleLayout = (layout) => {
      this.setState({ layout });
   }

   componentDidMount() {
      if (window != undefined) {
         window.addEventListener("resize", this.updateWidth, false);
      }
   }

   componentWillUnmount() {
      if (window != undefined) {
         window.removeEventListener("resize", this.updateWidth, false);
      }
   }

   toggleSidebarMenu(sidebarState) {
      this.setState({ sidebarState });
   }

   render() {
      return (
         <FoldedContentProvider>
            <FoldedContentConsumer>
               {context => (

                  <div
                     className={classnames("wrapper ", {
                        "menu-collapsed": (context as any).foldedContent || this.state.width < 991,
                        "main-layout": (!context as any).foldedContent,
                        [`${templateConfig.sidebar.size}`]: (this.state.sidebarSize === ''),
                        [`${this.state.sidebarSize}`]: (this.state.sidebarSize !== ''),
                        //    "layout-dark": (this.state.layout === 'layout-dark'),
                        //    " layout-dark": (this.state.layout === '' && templateConfig.layoutDark === true)
                        [`${templateConfig.layoutColor}`]: (this.state.layout === ''),
                        [`${this.state.layout}`]: (this.state.layout !== '')
                     })}
                  >

                     <Sidebar
                        toggleSidebarMenu={this.toggleSidebarMenu.bind(this)}
                        sidebarState={this.state.sidebarState}
                        handleSidebarSize={this.handleSidebarSize.bind(this)}
                        handleLayout={this.handleLayout.bind(this)}
                        location={this.props.location}
                        history={this.props.matchProps.history}
                     />

                     <Navbar
                        toggleSidebarMenu={this.toggleSidebarMenu.bind(this)}
                        location={this.props.location}
                        history={this.props.matchProps.history}
                     />
                     <main>{this.props.children}</main>
                  </div>
               )}
            </FoldedContentConsumer>
         </FoldedContentProvider>
      );
   }
}

export default MainLayout;
