// @ts-nocheck

import React, { useState, useEffect } from "react";
import {
    Form,
    Media,
    Collapse,
    Navbar,
    Nav,
    NavItem,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem
} from "reactstrap";
import { isTemplateExpression } from "typescript";
import DndComponent from '../../components/chat/DndComponent'


export default class PreviousChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            typeMsg: '',
            break: this.props.breakData ? this.props.breakData.goBreak : false,
            looding: false,
            dndModel: false,
            blockModel: false,
            selectCanned: false
        }
        this.messagesEndRef = React.createRef();
    };
    render(){
 
        
   
   if(this.props.location.params!=undefined){

   
    return (

       
                       <div className="chat-window">
                                <div className="mesgs" ref={(ref) => this.messagesEndRef = ref}>
                                    {(this.props.location.params.conversation.length >0&&this.props.location.params.conversation!=undefined&&this.props.location.params.conversation!=[]) &&this.props.location.params. conversation.map((item, i) => {
                                        if (item.userId==0) {
                                            return (<div className="outgoing_msg" key={item.userId + "" + i}>
                                                  <div className="incoming_msg_img">
                                                    <img className={'height_msg_img'} src="https://i.pinimg.com/originals/c2/04/47/c20447b5f198eabf85ee78b482dbc633.jpg" alt="sunil" />
                                                    {/* <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil" />  */}
                                                              
                                                </div>
                                                <div className="sent_msg">
                                                    <p>{item.messageText}</p>
                                                    <span className="time_date"></span>
                                                </div>

                                            </div>)
                                        } else{
                                            return (<div className="incoming_msg" key={i}  >
                                                  <div className="incoming_msg_img">
                                                    <img className={'height_msg_img'} src="https://i.pinimg.com/originals/c2/04/47/c20447b5f198eabf85ee78b482dbc633.jpg" alt="sunil" />
                                                    {/* <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil" />  */}
                                             
                                                     </div>
                                                <div className="received_msg">
                                                    <div className="received_withd_msg">
                                                        <p>{item.messageText}</p>
                                                        <span className="time_date"></span>
                                                    </div>
                                                </div>
                                            </div>)
                                        }
                                    })}
                                    {this.props.location.params.conversation.length==0&&(
                                          <text>No messages to display</text>)
                                    }

                                </div>

                            </div>
                    
                  
                                
           

    )
                                }else{
                                    return (
                                        <div className="chat-window">
                                            <div className="mesgs">
                                            <text>No messages to display</text>
                                            </div>
                                            </div>

                                    )


                                }
} }