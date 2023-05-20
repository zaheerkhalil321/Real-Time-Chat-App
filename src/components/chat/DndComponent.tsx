import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

interface DndComponentProps {
   title: string;
   visitorName: string;
   isOpen: boolean;
   OnYes: () => void;
   OnNo: () => void;
}

class DndComponent extends Component<DndComponentProps, {}> {

   render() {
      const { title, visitorName, isOpen } = this.props;
      return (
         <>
            {/* <div onClick={isOpen} > */}
            <div>
               <span className="font-small-dd">{title}</span>
            </div>
            <div className="text-center">
               <Modal
                  isOpen={isOpen}
               >
                  <ModalHeader>{title}</ModalHeader>
                  <ModalBody>
                     Are you sure you want to {title} {visitorName} chat?
               </ModalBody>
                  <ModalFooter>
                     <Button style={{ background: '#3874BA' }} onClick={() => this.props.OnYes()}>
                        Yes
                  </Button>{" "}
                     <Button style={{ background: '#727B83' }} onClick={() => this.props.OnNo()}>
                        No
                  </Button>
                  </ModalFooter>
               </Modal>
            </div>
         </>
      );
   }
}

export default DndComponent;
