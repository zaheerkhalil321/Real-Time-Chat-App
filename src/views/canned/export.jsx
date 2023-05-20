import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {
  TreeList, orderBy, filterBy, mapTree, extendDataItem,
  treeToFlat, TreeListToolbar
} from '@progress/kendo-react-treelist';
import { ExcelExport } from '@progress/kendo-react-excel-export';

const subItemsField = 'employees';
const expandField = 'expanded';
const columns = [
  { field: 'messageText', title: 'Message Text', width: 250, expandable: true },
  { field: 'color', title: 'Color'},
  { field: 'expiryDate', title: 'Expiry Date', format: '{0:d}' },
  { field: 'ticketNo', title: 'Ticket No' },
  { field: 'parentId', title: 'Parent Id'},
  { field: 'messageID', title: 'Message ID'},
  { field: 'languageId', title: 'Language ID'},
  { field: 'sortBy', title: 'Sort By'},
  { field: 'webSiteId', title: 'Website ID'},

];
let expanded = []
for (let index = 1; index < 1000; index++) {
  expanded.push(index)
}
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: [...this.props.data],
      dataState: {
        sort: [
          { field: 'messageText' }
        ],
        filter: []
      },
      expanded: expanded
    }
  }
  onExpandChange = (e) => {
    this.setState({
      expanded: e.value
        ? this.state.expanded.filter((id) => id !== e.dataItem.id)
        : [...this.state.expanded, e.dataItem.id],
    });
  };

  handleDataStateChange = (event) => {
    this.setState({
      dataState: event.dataState,
    });
  };

  addExpandField = (dataTree) => {
    const expanded = this.state.expanded;
    return mapTree(dataTree, subItemsField, (item) =>
      extendDataItem(item, subItemsField, {
        [expandField]: expanded.includes(item.id),
      })
    );
  };

  processData = () => {
    let { data, dataState } = this.state;
    let filteredData = filterBy(data, dataState.filter, subItemsField);
    let sortedData = orderBy(filteredData, dataState.sort, subItemsField);
    return this.addExpandField(sortedData);
  };

  exportToExcel = () => {
    this._export.save(
      treeToFlat(this.processData(), expandField, subItemsField),
      columns
    );
  };
  componentDidMount = () => {
    this.exportToExcel();
    this.props.handleExportClose(false)
  }
  render() {
    return (
      <ExcelExport
        ref={exporter => this._export = exporter}
        hierarchy={true}
      >
        <TreeList
          style={{ maxHeight: '0px', overflow: 'auto' }}
          expandField={expandField}
          subItemsField={subItemsField}
          onExpandChange={this.onExpandChange}
          sortable={{ mode: 'multiple' }}
          {...this.state.dataState}
          data={this.processData()}
          onDataStateChange={this.handleDataStateChange}
          columns={columns}
        />
      </ExcelExport>
    );
  }
}

export default App;