import React, { Component } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';



export class DataTableScrollDemo extends Component {

   

        state = {
            customers: [
                {UserName:'Hammad',NotSentChats:'test',AvgpendingTime:'test',LanguageId:'12',Chats:'test'},
                {UserName:'Hammad',NotSentChats:'test',AvgpendingTime:'test',LanguageId:'12',Chats:'test'},
                {UserName:'Hammad',NotSentChats:'test',AvgpendingTime:'test',LanguageId:'12',Chats:'test'},
                {UserName:'Hammad',NotSentChats:'test',AvgpendingTime:'test',LanguageId:'12',Chats:'test'},
                {UserName:'Hammad',NotSentChats:'test',AvgpendingTime:'test',LanguageId:'12',Chats:'test'},
                {UserName:'Hammad',NotSentChats:'test',AvgpendingTime:'test',LanguageId:'12',Chats:'test'},
                {UserName:'Hammad',NotSentChats:'test',AvgpendingTime:'test',LanguageId:'12',Chats:'test'},
              
              
            ],
            virtualCustomers: [],
            inmemoryData: [],
            lazyTotalRecords: 0,
            loading: false,
            virtualLoading: false
        };

    render() {
        return (
            <div className="datatable-scroll-demo">
                    <DataTable value={this.state.customers} scrollable scrollHeight="200px" style={{ width: '100%' }}>
                        <Column  header=""></Column>
                        <Column field="UserName" header="User Name" headerStyle={{ width: '150px' }}  columnKey="User Name"></Column> 
                        <Column field="NotSentChats" header="Not Sent Chats" headerStyle={{ width: '150px' }}  columnKey="Not Sent Chats"></Column>
                        <Column field="AvgpendingTime" header="Avg pending Time" headerStyle={{ width: '150px' }}  columnKey="Avg pending Time"></Column>
                        <Column field="LanguageId" header="Language id" headerStyle={{ width: '150px' }}  columnKey="Language id"></Column>
                        <Column field="Chats" header="Chats" headerStyle={{ width: '150px' }}  columnKey="Chats"></Column>
                      
                    </DataTable>
           
            </div>
        );
    }
}
export default DataTableScrollDemo;
   