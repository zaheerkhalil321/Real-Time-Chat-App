// @ts-nocheck
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Row, Col, Input, Form, FormGroup, Button, Card, CardBody, CardFooter } from "reactstrap";
import SnackBar from "../alert/SnackBar";
import { wglcsApiService } from '../../services/WglcsApiService';
import { reactRouterModel } from '../../models/index';



interface passwordProps {
   match: reactRouterModel
}


const NewPassword: React.FC<passwordProps> = ({ match, ...props }) => {
   const { history } = { ...props }
   const { params } = match;
   const token = params.t?.split('t=')[1];

   const [password, setPassword] = React.useState<String>('');
   const [openSnackBar, setOpenSnackBar] = React.useState<Boolean>(false);
   const [confirmPassword, setConfirmPassword] = React.useState<String>('');
   const [check, setCheck] = React.useState<Number>(0);
  async function registerPassword() {

      if (password == '' || confirmPassword == '') {
         setCheck(3);
      }
      else {
         if (password != confirmPassword) {
            setCheck(1);
         } else {
            const regix = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
            const obj = {
               "emailToken": token,
               "newPassword": password
            }
            if (regix.test(password)) {

              const response= await wglcsApiService.resetForgotPassword(obj);     
              if(response?.data?.status){
               setCheck(0);
            setOpenSnackBar(true); 
            setTimeout(function(){ history.push('/') }, 1500);
              }
             else alert('Your Session has expired! Re-enter Your Email')
               


            }
            else {

               setCheck(2)
            }
         }
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
                                 type="password"
                                 className="form-control"
                                 name="inputEmail"
                                 id="inputEmail"
                                 placeholder="new password"
                                 onChange={(e) => setPassword(e.target.value)}
                              />
                              <Input
                                 style={{ marginTop: 30 }}
                                 type="password"
                                 className="form-control"
                                 name="inputEmail"
                                 id="inputEmail"
                                 placeholder="Confirm password"
                                 onChange={(e) => setConfirmPassword(e.target.value)}
                              />
                           </Col>
                        </FormGroup>
                        {check == 1 ? <text className=" font-weight-bold font-small-3 text-danger">Password don't match!</text> : check == 2 ?
                                    <text className="text-red font-weight-bold font-small-3 text-danger">Password must have Minimum eight characters, at least one uppercase letter, one lowercase letter and one number!</text> : check == 3 ? <text className="text-red font-weight-bold font-small-3 text-danger">Please enter password!</text> : null}
                        <FormGroup className="pt-2">
                           <Col md="12">
                              <div className="text-center mt-3">
                                 <Button onClick={() => registerPassword()} color="danger" block>
                                    Submit
                                 </Button>
                                 <Button color="secondary" block>
                                    Cancel
                                 </Button>
                                
                              </div>
                           </Col>
                        </FormGroup>
                     </Form>
                  </CardBody>
                  {/* <CardFooter>
                     <div className="float-left white">
                        <NavLink exact className="text-white" to="/pages/login">
                           Login
                        </NavLink>
                     </div>
                     <div className="float-right white">
                        <NavLink exact className="text-white" to="/pages/register">
                           Register Now
                        </NavLink>
                     </div>
                  </CardFooter> */}
               </Card>
            </Col>
         </Row>
         <SnackBar open={openSnackBar} severity='success' message='Password changed successfully'/>

      </div>
   );
};

export default NewPassword;
