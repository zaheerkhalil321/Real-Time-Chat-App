/* eslint react/no-multi-comp: 0, react/prop-types: 0 */

import React, { useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import   './ChatPopup.css';
import ChatTable from './../constants/ChatTable';

const ChatPopup = (props) => {
    const {
        buttonLabel,
        classNamezzzz
    } = props;

    const [modal, setModal] = useState(false);

    const toggle = () => setModal(!modal);

    return (
        <div>
            <Button color="danger" style={{ right: "0", position: "absolute", zIndex: 1 }} onClick={toggle}>Chat Popup</Button>
            <Modal isOpen={modal} toggle={toggle} className="chatpopup">
                <ModalHeader toggle={toggle}>Chat Not Sent</ModalHeader>
                <ModalBody>
                    <ChatTable />
                </ModalBody>

            </Modal>
        </div>
    );
}

export default ChatPopup;