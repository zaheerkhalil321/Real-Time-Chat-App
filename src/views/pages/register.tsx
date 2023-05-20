import React, { Component } from "react";
import { NavLink } from "react-router-dom";
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
import { wglcsApiService } from "../../services/WglcsApiService";

interface RegisterState {
   isChecked: boolean,
   name: string,
   email: string,
   password: string
}

class Register extends Component<{}, RegisterState> {
   state = {
      isChecked: true,
      name: '',
      email: '',
      password: ''
   };

   handleChecked = e => {
      this.setState(prevState => ({
         isChecked: !prevState.isChecked
      }));
   };

   handleSignUpClick = () => {
      const { name, email, password } = this.state
      if (name && email && password) {
         wglcsApiService.userSignUp(name, email, password);
      }
   }

   render() {
      return (
         <div className="container">
            <Row className="full-height-vh">
               <Col xs="12" className="d-flex align-items-center justify-content-center">
                  <Card className="gradient-indigo-purple text-center width-400">
                     <CardBody>
                        <h2 className="white py-4">Register</h2>
                        <Form className="pt-2">
                           <FormGroup>
                              <Col md="12">
                                 <Input
                                    type="text"
                                    onChange={(value) => { this.setState({ name: value.target.value }) }}
                                    className="form-control"
                                    name="inputName"
                                    id="inputName"
                                    placeholder="Name"
                                    required
                                 />
                              </Col>
                           </FormGroup>
                           <FormGroup>
                              <Col md="12">
                                 <Input
                                    type="email"
                                    onChange={(value) => { this.setState({ email: value.target.value }) }}
                                    className="form-control"
                                    name="inputEmail"
                                    id="inputEmail"
                                    placeholder="Email"
                                    required
                                 />
                              </Col>
                           </FormGroup>

                           <FormGroup>
                              <Col md="12">
                                 <Input
                                    type="password"
                                    onChange={(value) => { this.setState({ password: value.target.value }) }}
                                    className="form-control"
                                    name="inputPass"
                                    id="inputPass"
                                    placeholder="Password"
                                    required
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
                                          I agree terms and conditions.
                                       </Label>
                                    </div>
                                 </Col>
                              </Row>
                           </FormGroup>
                           <FormGroup>
                              <Col md="12">

                                 <Button type="button" onClick={this.handleSignUpClick} color="danger" block className="btn-pink btn-raised">
                                    Submit
                                 </Button>
                                 <Button type="button" color="secondary" block className="btn-raised">
                                    Cancel
                                 </Button>
                              </Col>
                           </FormGroup>
                        </Form>
                     </CardBody>
                     <CardFooter>
                        <div className="float-left">
                           <NavLink to="/forgotPassword" className="text-white">
                              Forgot Password?
                           </NavLink>
                        </div>
                        <div className="float-right">
                           <NavLink to="/" className="text-white">
                              Login
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

export default Register