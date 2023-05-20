
import React, { useState, useRef, useEffect } from 'react';
import {
    Modal,
    ModalHeader,
    ModalBody,
    Button,
    ModalFooter} from "reactstrap";
const ConfirmDialogDemo = (props) => {
    const [visible, setVisible] = useState<boolean>(props.visible);
    const toast = useRef(null);

    useEffect(() => {
        setVisible(props.visible)
    }, [props.visible])

    const accept = () => {
        props.handleAccept(true, props.differentiate);
        setVisible(false)
        props.handleClose(false)
    }

    const reject = () => {
        props.handleAccept(false);
        setVisible(false)
        props.handleClose(false)
    }

    return (
        // <div>
        //     <Toast ref={toast} />
        //         <ConfirmDialog visible={visible} onHide={() => {setVisible(false); props.handleClose(false) }} message={props.message}
        //             header="Confirmation" icon="pi pi-exclamation-triangle" accept={accept} reject={reject} />
        // </div>
        <div className="text-center">
            <Modal isOpen={visible}>
                <ModalHeader>{props.header}</ModalHeader>
                <ModalBody>
                    {props.message}
                </ModalBody>
                <ModalFooter>
                    <Button style={{ background: '#3874BA' }} onClick={() => accept()}>
                        Yes
                    </Button>{" "}
                    <Button style={{ background: '#727B83' }} onClick={() => reject()}>
                        No
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
export default ConfirmDialogDemo