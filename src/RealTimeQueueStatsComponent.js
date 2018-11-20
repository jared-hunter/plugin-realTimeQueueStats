import React from "react";
import { Table } from "react-bootstrap";
import { SyncClient } from "twilio-sync";
import { css } from "react-emotion";

const realTimeStatsMainDiv = css`
  margin-bottom: 25px;
  margin-left: 15px;
  margin-right: 15px;
`;

const headerSpacing = css`
  margin-bottom: 25px;
`;

export class RealTimeQueueStatsComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {}
    };
  }

  handleItemUpdate(mapItem) {
    var dataMap = this.state.data;
    dataMap[mapItem.key] = mapItem.value;
    this.setState({ data: dataMap });
  }

  pageHandler(paginator) {
    paginator.items.forEach(item => {
      this.handleItemUpdate(item);
    });
    return paginator.hasNextPage
      ? paginator.nextPage().then(this.pageHandler)
      : null;
  }

  componentDidMount() {
    // create syncClient on component mount
    this.syncClient = new SyncClient(this.props.token);

    // fetch initial data map
    this.syncClient.map(this.props.syncMapName).then(map => {
      map
        .getItems()
        .then(paginator => {
          this.pageHandler(paginator);
        })
        .catch(function(error) {
          console.error("Map getItems() failed", error);
        });
    });

    // Add listener for future updates to existing items
    this.syncClient.map(this.props.syncMapName).then(map => {
      map.on("itemUpdated", args => {
        this.handleItemUpdate(args.item);
      });
    });

    // Add listener for future additions to map
    this.syncClient.map(this.props.syncMapName).then(map => {
      map.on("itemAdded", args => {
        this.handleItemUpdate(args.item);
      });
    });

    //TODO : add listener for removal of queue
  }

  componentWillUnmount() {
    this.syncClient = null;
  }

  render() {
    return (
      <div className={realTimeStatsMainDiv}>
        <link
          rel="stylesheet"
          href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
          integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
          crossorigin="anonymous"
        />
        <h3 className={headerSpacing}>Real Time Queue Stats Data</h3>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Queue Name</th>
              <th>Assigned</th>
              <th>Pending</th>
              <th>Reserved</th>
              <th>Wrapping</th>
              <th>Total Tasks</th>
              <th>Total Available Workers</th>
            </tr>
          </thead>
          <tbody>
            <GetRows data={this.state.data} />
          </tbody>
        </Table>
      </div>
    );
  }
}

function GetRows(props) {
  let data = props.data;
  let response = [];
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  Object.keys(data).forEach(item => {
    if (data[item].friendlyName) {
      response.push(
        <tr key={data[item].taskQueueSid}>
          <td>{data[item].friendlyName}</td>
          <td>{data[item].tasksByStatus.assigned}</td>
          <td>{data[item].tasksByStatus.pending}</td>
          <td>{data[item].tasksByStatus.reserved}</td>
          <td>{data[item].tasksByStatus.wrapping}</td>
          <td>{data[item].totalTasks}</td>
          <td>{data[item].totalAvailableWorkers}</td>
        </tr>
      );
    }
  });

  return response;
}
export default RealTimeQueueStatsComponent;
