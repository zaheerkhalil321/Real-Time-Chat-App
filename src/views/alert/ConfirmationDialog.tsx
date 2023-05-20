
import React, { useState, useRef, useEffect } from 'react';
import { ConfirmDialog } from 'primereact/confirmdialog';
import "./ConfirmationDialog.css";


const Confirmation = (props) => {
    const [visible, setVisible] = useState<boolean>(props.Open);
    const toast = useRef(null);

    useEffect(() => {
        setVisible(props.Open)
    }, [props.Open])

    const accept = () => {
        props.ConfirmationResponse(true,props.ConfirmationMode);
    }

    const reject = () => {
        props.ConfirmationResponse(false,props.ConfirmationMode);
    }

    const myIcon =()=> {
        return(
        <button className="p-dialog-titlebar-icon p-link">
            <span onClick={reject} className="pi pi-times"></span>
        </button>
        )
    }
    
    return (
        <div>
            <ConfirmDialog icons={myIcon} visible={visible} onHide={() =>setVisible(false)} message={props.message}
                header="Confirmation" closable={false} icon="pi pi-exclamation-triangle" accept={accept} reject={reject} />
        </div>
    )
}
export default Confirmation