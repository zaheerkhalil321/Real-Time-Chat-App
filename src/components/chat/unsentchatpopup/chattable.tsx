import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { UnSentChatMDL } from './../../../models/index';
interface UnsentChatState {
    unsentChats: UnSentChatMDL[],
    virtualCustomers: any,
    inmemoryData: any,
    lazyTotalRecords: Number,
    loading: boolean,
    virtualLoading: boolean
}
interface UnsentChatProps {
    unsentChats: any,
}

class DataTableScrollDemo extends Component<UnsentChatProps, UnsentChatState> {

    constructor(props) {
        super(props);
        this.state = {
            virtualCustomers: [],
            inmemoryData: [],
            lazyTotalRecords: 0,
            loading: false,
            virtualLoading: false,
            unsentChats: this.props.unsentChats
        };
    }


    render() {
        return (
            <div className="datatable-scroll-demo">
                {this.props.unsentChats &&
                    <DataTable value={this.props.unsentChats} scrollable scrollHeight="200px" style={{ width: '100%' }}>
                        <Column header=""></Column>
                        <Column field="userName" header="User Name" headerStyle={{ width: '150px' }} columnKey="User Name"></Column>
                        <Column field="notSentChats" header="Not Sent Chats" headerStyle={{ width: '150px' }} columnKey="Not Sent Chats"></Column>
                        <Column field="avgPendingTime" header="Avg pending Time" headerStyle={{ width: '150px' }} columnKey="Avg pending Time"></Column>
                        <Column field="languageId" header="Language id" headerStyle={{ width: '150px' }} columnKey="Language id"></Column>
                        <Column field="chats" header="Chats" headerStyle={{ width: '100%' }} columnKey="Chats" style={{ 'white-space': 'nowrap' }}></Column>

                    </DataTable>}

            </div>
        );
    }
}
export default DataTableScrollDemo;
