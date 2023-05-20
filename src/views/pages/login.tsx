import React, { Component } from "react";
import { ProgressSpinner } from 'primereact/progressspinner';
import { NavLink } from "react-router-dom";
import Spinner from "./../../components/spinner/spinner";
import { loginService } from '../../services/loginService';
import { UserData, CookiesLogin } from '../../models/index';
import './login.css';


import {
   Row,
   Col,
   Input,
   Form,
   FormGroup,
   Button,
   Label,
   Card,
   CardBody,
   CardFooter
} from "reactstrap";
import { Toast } from 'primereact/toast';
import Cookies from 'universal-cookie';

interface LoginState {
   isChecked: boolean;
   erroremail: boolean;
   errorpassword: boolean;
   errorlicenseKey: boolean;
   email: string;
   password: string;
   licenseKey: string;
   isLoading: boolean;
   customLoading: boolean


}

interface LoginProps {
   onSuccess: (LoginResponse: UserData) => void;
}
const cookies = new Cookies();
class Login extends Component<LoginProps, LoginState> {

   toast: Toast | null = null;

   constructor(props) {
      super(props);
      var userCookies = cookies.get('loginCookies') as CookiesLogin;
      this.state = {
         isChecked: userCookies ? true : false,
         email: userCookies?.userName ?? '',
         password: userCookies?.password ?? '',
         licenseKey: userCookies?.licenseKey ?? '',
         erroremail: false,
         errorpassword: false,
         errorlicenseKey: false,
         isLoading: false,
         customLoading: false

      };

      this.handleLoginClick = this.handleLoginClick.bind(this);
      this.handleChecked = this.handleChecked.bind(this);
   }
   componentDidMount() {

      document.addEventListener('keydown', this.processKeyEvent)
   }

   handleChecked() {
      this.setState(prevState => ({
         isChecked: !prevState.isChecked
      }));
   };
   processKeyEvent = (event) => {

      if (event.key == 'Enter') {

         this.handleLoginClick();
      }
   }
   async handleLoginClick() {

      const { email, password, licenseKey } = this.state

      if (email && password && licenseKey) {
         this.setState({ customLoading: true })
         var loginResult = await loginService.login(email, password, licenseKey);


         if (loginResult.success) {
            this.setState({ customLoading: false })
            if (this.state.isChecked) {

               var obj = {
                  userName: email,
                  password,
                  licenseKey
               } as CookiesLogin;

               cookies.set('loginCookies', obj, { path: '/' });
            }
            else { cookies.remove('loginCookies'); }

            localStorage.setItem('USER_DATA', JSON.stringify(loginResult.data));
            localStorage.setItem('unsentPopup','true')
            this.props.onSuccess(loginResult.data.userLoginData);
         } else {
            this.setState({ customLoading: false })
            this.toast?.show({ severity: 'error', summary: 'Authentication', detail: 'Please check your credentials and try again!' });
         }

      } else {
         if (!email) {
            this.setState({ erroremail: true })

         } else {
            this.setState({ erroremail: false })
         }
         if (!password) {
            this.setState({ errorpassword: true })

         } else {
            this.setState({ errorpassword: false })
         }
         if (!licenseKey) {
            this.setState({ errorlicenseKey: true })

         } else {
            this.setState({ errorlicenseKey: false })
         }
         this.toast?.show({ severity: 'error', summary: 'Authentication', detail: 'Please enter your credentials!' });
         // this.toast?.show({severity: 'error', summary: 'Authentication', detail: "Please check your credentials and try again"});
      }
   }
   componentWillUnmount() {
      document.removeEventListener('keydown', this.processKeyEvent)
   }

   render() {
      const { erroremail, errorpassword, errorlicenseKey, isLoading } = this.state

      if (isLoading) {
         return (<Spinner />)
      } else {
         return (
            <div className="container">
               <Toast ref={r => this.toast = r as any} />
               <Row className="">
                  <Col xs="12" className="d-flex align-items-center justify-content-center">
                     <Card className="gradient-indigo-purple text-center">
                        <CardBody>
                           <h2 className="white py-4">Login</h2>
                           <Form className="pt-2">
                              <FormGroup>
                                 <Col md="12">
                                    <Input
                                       onChange={(value) => { this.setState({ email: value.target.value.toString(), erroremail: false }) }}
                                       value={this.state.email}
                                       type="email"
                                       className="form-control"
                                       name="inputEmail"
                                       id="inputEmail"
                                       placeholder="UserName/Email"
                                       style={erroremail ? { borderWidth: 1, borderColor: 'red' } : {}}
                                       required
                                    />
                                 </Col>
                              </FormGroup>

                              <FormGroup>
                                 <Col md="12">
                                    <Input
                                       onChange={(value) => { this.setState({ password: value.target.value, errorpassword: false }) }}
                                       value={this.state.password}
                                       type="password"
                                       className="form-control"
                                       style={errorpassword ? { borderWidth: 1, borderColor: 'red' } : {}}
                                       name="inputPass"
                                       id="inputPass"
                                       placeholder="Password"
                                       required
                                    />
                                 </Col>
                              </FormGroup>
                              <FormGroup>
                                 <Col md="12">
                                    <Input
                                       onChange={(value) => { this.setState({ licenseKey: value.target.value, errorlicenseKey: false }) }}
                                       value={this.state.licenseKey}
                                       type="text"
                                       className="form-control"
                                       style={errorlicenseKey ? { borderWidth: 1, borderColor: 'red' } : {}}
                                       name="licenseKey"
                                       id="licenseKey"
                                       placeholder="license Key"
                                       required
                                    // onKeyPress={(event) => {
                                    //    if (event.key === 'Enter') {
                                    //       this.handleLoginClick()
                                    //    }
                                    // }
                                    // }
                                    />
                                 </Col>
                              </FormGroup>
                              <FormGroup>
                                 <Row>
                                    <Col md="12">
                                       <div className="custom-control custom-checkbox mb-2 mr-sm-2 mb-sm-0 ml-3">
                                          <Input
                                             type="checkbox"
                                             className="custom-control-input"
                                             checked={this.state.isChecked}
                                             onChange={this.handleChecked}
                                             id="rememberme"
                                          />
                                          <Label className="custom-control-label float-left white" for="rememberme">
                                             Remember Me
                                       </Label>
                                       </div>
                                    </Col>
                                 </Row>
                              </FormGroup>
                              <FormGroup style={{ marginBottom: "0px" }}>
                                 <Col md="12">
                                    {this.state.customLoading ? <ProgressSpinner /> :
                                       <Button type="button"
                                          onClick={this.handleLoginClick}
                                          color="danger" block className="btn-pink btn-raised">
                                          Submit
                                 </Button>}
                                 </Col>
                              </FormGroup>
                           </Form>
                        </CardBody>
                        <CardFooter>
                           <div className="float-left w-100">
                              <NavLink to="/forgotPassword" className="text-white">
                                 Forgot Password?
                           </NavLink>
                           </div>
                        </CardFooter>
                     </Card>
                  </Col>
               </Row>
            </div>
         );
      }
   }
}

export default Login;