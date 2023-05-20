import React, { Props } from "react";
import { Modal, ModalFooter, Table } from "reactstrap";
import { AvailableUserForTransfer } from "../../models";

interface OperatorListProps {
    modalState: boolean;
    availableOperators: AvailableUserForTransfer[];
    toggle(): void;
    OnOperatorSelected(operatorId: number): void;


}

const OperatorList = (props: OperatorListProps) => {
    const [showTransferButton, setShowTransferButtton] = React.useState(false);
    const [operatorId, setOperatorId] = React.useState<any | null>(null);
    return (
        <Modal className="transfer-modal" isOpen={props.modalState} toggle={() => { props.toggle(); setShowTransferButtton(false); setOperatorId(null) }}>
            <ModalFooter>

                {showTransferButton && (<button className="transfer" onClick={() => { props.OnOperatorSelected(operatorId); setShowTransferButtton(false); setOperatorId(null) }}>Transfer</button>)}
                <Table striped >
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Current Chats</th>
                            <th>Employee Email</th>

                        </tr>
                    </thead>

                    {props.availableOperators.length > 0 ?
                        props.availableOperators.map((item, i) => {
                            return (
                                <tbody key={i}>
                                    <tr style={{ background: item.userId == operatorId ? '#dedede' : 'white', cursor: 'pointer' }} onClick={() => { setOperatorId(item.userId); setShowTransferButtton(true) }} >
                                        <td>{item.userName}</td>
                                        <td>{item.currentChats}</td>
                                        <td>{item.employeeEmail}</td>
                                    </tr>
                                </tbody>)
                        }) : <tbody style={{ textAlign: 'center' }}><tr><td colSpan={3}>No Agent available</td></tr></tbody>}
                </Table>

            </ModalFooter>
        </Modal>
    );
}

export default OperatorList;

