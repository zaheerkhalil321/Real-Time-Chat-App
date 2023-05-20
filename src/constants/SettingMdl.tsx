
import React, {useState } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import './SettingModal.css';
import { InputSwitch } from 'primereact/inputswitch';

const SettingModal = (props) => {
    const[checked1,setchecked1] = useState(false)

    const {
        buttonLabel,
        className,
        value

    } = props;
    const togglee = () => {
        props.toggle(!value)
    }

    return (

        <Modal isOpen={value} toggle={togglee} className="setting-modal">
            <ModalHeader toggle={togglee}>Settings</ModalHeader>
            <ModalBody>
                <div className="form-group switch-btn ">
                    <h2>Username</h2>
                    <InputSwitch checked={checked1} onChange={(e) => setchecked1(e.value)} />
                </div>
                <div className="form-group switch-btn ">
                    <h2>Username</h2>
                    <InputSwitch checked={checked1} onChange={(e) => setchecked1(e.value)} />
                </div><div className="form-group switch-btn ">
                    <h2>Username</h2>
                    <InputSwitch checked={checked1} onChange={(e) => setchecked1(e.value)} />
                </div>
                <div className="form-group switch-btn ">
                    <h2>Username</h2>
                    <InputSwitch checked={checked1} onChange={(e) => setchecked1(e.value)} />
                </div>
            </ModalBody>
        </Modal>
        );
}

export default SettingModal;