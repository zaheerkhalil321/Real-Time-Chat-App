/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState,useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import   './chatpopup.css';
import { UnSentChatMDL,LoginResponse } from '../../../models';
import ChatTable from './chattable';
import { wglcsApiService } from './../../../services/WglcsApiService'
const ChatPopup = (props) => {
    var userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse;
    const [modal, setModal] = useState(true);
    const [unsentChats,setUnsentChats] = useState()
    const [UserData,setUserData] = useState(userData)
    const FetchUnsentChats = async() =>{
        let data:UnSentChatMDL =  (await wglcsApiService.getcountofnotsentchatsofuserschatids(UserData.userLoginData.empCompId,5)).data?.data??[];
        setUnsentChats(data as any)
    }
    useEffect(() => {
        FetchUnsentChats()
    }, [])
    const toggle = () => setModal(!modal);

    const handleClose = () =>{
        props.unsentChatCondition(false)
    }
    return (
        <div>
            <Modal isOpen={modal} onClosed={()=>{handleClose()}} toggle={toggle} className="chatpopup">
                <ModalHeader toggle={toggle}>Chats Not Sent</ModalHeader>
                <ModalBody>
                    <ChatTable unsentChats={unsentChats} />
                </ModalBody>

            </Modal>
        </div>
    );
}

export default ChatPopup;