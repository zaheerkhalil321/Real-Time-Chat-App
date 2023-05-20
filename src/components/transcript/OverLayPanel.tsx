import React, { useState, useEffect, useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Toast } from 'primereact/toast';
import { Column } from 'primereact/column';
import './OverlayPanelDemo.css';
import  "../../assets/GlobalStyle.css";
import { InputText } from 'primereact/inputtext';
import { TreeTable } from 'primereact/treetable';
import { ScrollPanel } from 'primereact/scrollpanel';
import {Checkbox} from 'primereact/checkbox';

const OverlayPanelDemo = (props) => {    
    const [selectedWebsites, SetSelectedWebsites] = useState([] as any);
    const [allSelectedItems, SetAllSelectedItems] = useState([] as any);    
    const [selectedWebsitesTitle, SetselectedWebsitesTitle] = useState("");
    const [isAllSelected, SetIsAllSelected] = useState(false);    
    const op = useRef(null as any);
    const toast = useRef(null);
    const isMounted = useRef(false);
    

    useEffect(() => {
        SetIsAllSelected(true)
        SelectAll(props.nodes)
    }, [props.nodes]); 



    const SelectAll=(nodes)=>{
        var DefaultSelected=[] as any  
        nodes.forEach(element => {
            DefaultSelected.push(element.key)
            if(element.children.length>0){
                element.children.forEach(child => {
                    DefaultSelected.push(child.key)
                });
            }
        }); 
        
        const obj = {};
            for (let key of DefaultSelected){
                obj[key] = {
                checked: true,
                partialChecked: false,
            }
        }     
        SetSelectedWebsites(obj)
        SetAllSelectedItems(obj)
    }
    


    const handleWebsiteSelection=(e)=>{
        SetSelectedWebsites(e.value)       
    }


    useEffect(()=>{
         arrayToString(selectedWebsites)       
    },[selectedWebsites])



    const arrayToString=(selectedWebsite)=>{
        var selectedItem=0;
        var selectedWeb=[] as any;
        let strings=[] as any;
        Object.entries(selectedWebsite).forEach(element => {
          let data=element[0].split(":");
          if(data[2]==="Child"){
             selectedWeb.push(data[0])
             strings.push(data[1])
             selectedItem=selectedItem+1;      
          }
        });  
        if(selectedItem>3){SetselectedWebsitesTitle(strings.length +" item selected")}
        else{SetselectedWebsitesTitle(strings.join())} 
        
        var convertedArray = selectedWeb.map((i) => Number(i));
        props.getSelectedWebsite(convertedArray.join(),allSelectedItems)
    }


    const header=()=>{
        return(
            <div className="p-col-12">
            <Checkbox inputId="cb1" value="New York" onChange={handleSelectAll} ></Checkbox>
            <label htmlFor="cb1" className="p-checkbox-label">Select All</label>
        </div>)
    }



    const handleSelectAll=(e)=>{   
        if(e.checked){     
            SetIsAllSelected(true)
            SelectAll(props.nodes)
        }
        else{ 
            SetIsAllSelected(false)     
            SetSelectedWebsites([])  
        }
    }

   

    const selectNode=(e)=>{  
              
    }

   
    const footer =  <div className="p-col-12 py-0">
            <Checkbox inputId="cb1" checked={isAllSelected} onChange={handleSelectAll} ></Checkbox>
            <label htmlFor="cb1" style={{display:"inline",padding:"5px",fontWeight:500,position: "relative",top:"1px",fontSize:"13px"}} className="p-checkbox-label">Select All</label>
        </div>;

    return (
        <div>
            <Toast ref={toast} />
            <div className="card Transcript">
                <span className="p-input-icon-right">
                    <i className="pi pi-angle-down" />
                    <InputText style={{cursor:"pointer"}} placeholder="Select Websites" onClick={(e) => op.current.toggle(e)} value={selectedWebsitesTitle} />
                </span>
                <OverlayPanel ref={op} id="overlay_panel"  style={{width: '450px'}} className="overlaypanel-demo overlay-box"  dismissable>
                        <TreeTable scrollable scrollHeight="295px"  value={props.nodes}                            
                             selectionMode="checkbox"                              
                            header={footer}           
                            selectionKeys={selectedWebsites}  
                            onSelectionChange={(e)=>handleWebsiteSelection(e)} 
                            onSelect={(e)=>selectNode(e)}
                            >
                            <Column field="label"  filter filterMatchMode="contains" filterPlaceholder="Search" expander></Column>
                        </TreeTable>
                </OverlayPanel>
            </div>
        </div>
    )
}
        
export default OverlayPanelDemo