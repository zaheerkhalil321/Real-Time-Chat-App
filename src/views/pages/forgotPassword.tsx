// @ts-nocheck
import React from "react";
import { NavLink } from "react-router-dom";
import { Row, Col, Input, Form, FormGroup, Button, Card, CardBody, CardFooter } from "reactstrap";
import { wglcsApiService } from '../../services/WglcsApiService';

const ForgotPassword: React.FC = (props) => {

   const [input, setInput] = React.useState<string>('');
   const [link, setLink] = React.useState<boolean>(false);
   const [emailError, setEmailError] = React.useState<boolean>(false);
   function registerMail() {
      var emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

      if (input != '') {
         if (!emailRegex.test(input)) {
            setLink(false);
            setEmailError(true);
         } else {
            wglcsApiService.forgetPassword(input);
            setLink(true);
            setEmailError(false)
         }
      }
      else {
         setLink(false);
      }
   }
   return (
      <div className="container">
         <Row className="full-height-vh">
            <Col xs="12" className="d-flex align-items-center justify-content-center">
               <Card className="gradient-indigo-purple text-center width-400">
                  <CardBody>
                     <div className="text-center">
                        <h4 className="text-uppercase text-bold-400 white py-4">Forgot Password</h4>
                     </div>
                     <Form className="pt-2">
                        <FormGroup>
                           <Col md="12">
                              <Input
                                 type="email"
                                 className="form-control"
                                 name="inputEmail"
                                 id="inputEmail"
                                 placeholder="Your Email Address"
                                 onChange={(e) => setInput(e.target.value)}
                                 value={input}
                              />
                           </Col>
                        </FormGroup>
                        <FormGroup className="pt-2">
                           <Col md="12">
                              <div className="text-center mt-3">
                                 {emailError && <text className="text-danger" style={{ position: 'absolute', left: 100, bottom: 92, fontSize: 14, fontWeight: 'bold', paddingBottom: 18 }}>Invalid Email Format!!</text>}
                                 {link ? <text style={{ color: 'white', position: 'absolute', left: 43, bottom: 35, fontSize: 14, fontWeight: 'bold', paddingBottom: 18 }}>Link has been sent to your email address!</text> :
                                    <Button onClick={() => registerMail()} color="danger" block>
                                       Submit
                                 </Button>}
                                 <Button onClick={() => { setLink(false); setInput(''); setEmailError(false) }} color="secondary" block>
                                    Cancel
                                 </Button>
                              </div>
                           </Col>
                        </FormGroup>
                     </Form>
                  </CardBody>
                  <CardFooter>
                     <div className="float-left white w-100">
                        <NavLink exact className="text-white" to="/">
                           Login
                        </NavLink>
                     </div>
                  </CardFooter>
               </Card>
            </Col>
         </Row>
      </div>
   );
};

export default ForgotPassword;
