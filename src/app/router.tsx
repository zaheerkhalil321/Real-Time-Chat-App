import React, { Component, Suspense, lazy } from 'react';
import { BrowserRouter, Switch } from 'react-router-dom';
import Spinner from '../components/spinner/spinner';
import FullPageLayout from '../layouts/routes/fullpageRoutes';
import ErrorLayoutRoute from '../layouts/routes/errorRoutes';
import { LoginResponse } from '../models';
import { routes as SideMenuRoutes } from '../layouts/components/sidebar/sidemenu'
import MainLayoutRoutes from '../layouts/routes/mainRoutes';
import * as _ from 'lodash';

const LazyResourcesPersonalInformation = lazy(() => import('./../views/resourcesPool/personal-information'));
const LazyResourcesTrainedOn = lazy(() => import('./../views/resourcesPool/trained-on'));
const LazyResourcesTrainedOnAssign = lazy(() => import('./../views/resourcesPool/trained-on-assign'));
const LazyPreviousMessages = lazy(() => import('./../views/chat/PreviousChat'));
const LazyForgotPassword = lazy(() => import('./../views/pages/forgotPassword'));
const LazyNewPassword = lazy(() => import('./../views/pages/newPassword'));
const LazyLogin = lazy(() => import('./../views/pages/login'));
const LazyRegister = lazy(() => import('./../views/pages/register'));
const LazyMaintainance = lazy(() => import('./../views/pages/maintainance'));
const LazyLockScreen = lazy(() => import('./../views/pages/lockScreen'));
const LazyErrorPage = lazy(() => import('./../views/pages/error'));


class RouterState {
   currentUser: LoginResponse | null | undefined;
}

class Router extends Component<{}, RouterState> {

   constructor(props) {
      super(props);

      this.state = {
         currentUser: (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse
      };

   }

   handleLogin = (response: LoginResponse) => {

      this.setState({
         currentUser: response
      });
   }

   getUserPermittedRoutes = () => {
      return SideMenuRoutes.filter(route => route.interfaceName == '' || _.some(this.state.currentUser?.interfaces, item => item.interfaceName.toLowerCase() == route.interfaceName.toLowerCase()));
   }

   render() {
      if (this.state.currentUser == null) {
         // if (false) {
         return (
            // Set the directory path if you are deplying in sub-folder
            <BrowserRouter basename={`${process.env.PUBLIC_URL}/`}>
               <Switch>

                  <FullPageLayout
                     exact
                     path="/"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyLogin {...matchprops} onSuccess={this.handleLogin} />
                        </Suspense>
                     )}
                  />
                  <FullPageLayout
                     exact
                     path="/newPassword/:t?"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyNewPassword {...matchprops} onSuccess={this.handleLogin} />
                        </Suspense>
                     )}
                  />
                  <FullPageLayout
                     exact
                     path="/forgotPassword"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyForgotPassword {...matchprops} onSuccess={this.handleLogin} />
                        </Suspense>
                     )}
                  />
                  <FullPageLayout
                     exact
                     path="/register"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyRegister {...matchprops} onSuccess={this.handleLogin} />
                        </Suspense>
                     )}
                  />

                  <ErrorLayoutRoute
                     exact
                     login={true}
                     path="/pages/error"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyErrorPage {...matchprops} />
                        </Suspense>
                     )}
                  />

                  <ErrorLayoutRoute
                     exact
                     login={true}
                     path="/pages/error"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyErrorPage {...matchprops} />
                        </Suspense>
                     )}
                  />

                  <ErrorLayoutRoute
                     login={true}
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyLogin {...matchprops} onSuccess={this.handleLogin} />
                        </Suspense>
                     )}
                  />
               </Switch>
            </BrowserRouter>
         );
      } else {

         return (

            // Set the directory path if you are deplying in sub-folder
            <BrowserRouter basename={`${process.env.PUBLIC_URL}/`}>
               <Switch>

                  {this.getUserPermittedRoutes().map(route => {
                     return(
                        <MainLayoutRoutes
                        exact
                        key={route.path}
                        path={route.path}
                        render={matchprops => (
                           <Suspense fallback={<Spinner />}>
                              {React.createElement(route.component, {...matchprops, ...route.componentProps})}
                           </Suspense>
                        )}/>
                     )
                  })}

                  <MainLayoutRoutes
                     exact
                     path="/resources/personal-information"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyResourcesPersonalInformation {...matchprops} />
                        </Suspense>
                     )}
                  />


                  <MainLayoutRoutes
                     exact
                     path="/resources/trained-on"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyResourcesTrainedOn {...matchprops} />
                        </Suspense>
                     )}
                  />
                  <MainLayoutRoutes
                     exact
                     path="/resources/trained-on-assign"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyResourcesTrainedOnAssign {...matchprops} />
                        </Suspense>
                     )}
                  />
                  <FullPageLayout
                     exact
                     path="/pages/lockscreen"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyLockScreen {...matchprops} />
                        </Suspense>
                     )}
                  />

                  <FullPageLayout
                     exact
                     path="/pages/maintenance"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyMaintainance {...matchprops} />
                        </Suspense>
                     )}
                  />

                  <MainLayoutRoutes
                     exact
                     path="/previousChat"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyPreviousMessages {...matchprops} />
                        </Suspense>
                     )}
                  />

                  <ErrorLayoutRoute
                     exact
                     login
                     path="/pages/error"
                     render={matchprops => (
                        <Suspense fallback={<Spinner />}>
                           <LazyErrorPage {...matchprops} />
                        </Suspense>
                     )}
                  />
               </Switch>
            </BrowserRouter>
         );
      }
   }
}

export default Router;
