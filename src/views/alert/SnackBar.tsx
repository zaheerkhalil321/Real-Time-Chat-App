import React, { useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import './toast.css';


export default function CustomizedSnackbars(props) {
  const toast = useRef(null as any);

  const handleClose = () =>{
    props.handleClose(false)
  }
  useEffect(()=>{ 
    if(props.open){
    toast.current.show({severity:props.severity, summary: 'Response', detail:props.message, life: 3000});
    }
  },[props.open])

  return (
    <>
       <Toast ref={toast} onRemove = {()=>{handleClose()}} onHide={()=>{handleClose()}} />
    </>
  );
}