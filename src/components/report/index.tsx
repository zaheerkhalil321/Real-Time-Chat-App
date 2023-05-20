import React, { Component } from "react";
import { Link } from 'react-router-dom';
import './report.css';
import "../../assets/GlobalStyle.css";
import 'primeflex/primeflex.css';
import moment from 'moment';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { wglcsApiService } from '../../services/WglcsApiService'
import { LoginResponse } from '../../models/index';
import TotalChats from "../../views/report/TotalChats";
import TotalDuration from "../../views/report/TotalDuration";
import TotalAgentsChat from "../../views/report/TotalAgentsChat";
import ChatResponseTime from "../../views/report/ChatResponseTime";
import ChatAvailability from "../../views/report/ChatAvailability";
import { ProgressSpinner } from 'primereact/progressspinner';
import _ from "lodash";


interface reportComponentState {
    loading: boolean,
    tableloading: boolean,
    websites: [],
    selectedWebsite: [],
    TotalDays: [],
    websiteId: number,
    fromDate: Date,
    toDate: Date,
    dayWiseReport: [],
    hoursWiseReport: [],
    userWiseReport: [],
    chatResponseReport: [],
    firstIndex: [],
    firstId: number,
    BtnDisabled: boolean,
}


class reportComponent extends Component<{}, reportComponentState> {
    constructor(props) {
        super(props);

        var fDate = moment(new Date().setDate(new Date().getDate() - 5)).format('YYYY-MM-DD');
        var tDate = moment(new Date().setDate(new Date().getDate() - 1)).format('YYYY-MM-DD');

        // var time = "00:00:00"; 
        // var fTD = moment(fDate + ' ' + time).toDate();

        // var time = "00:00:00"; 
        // var tTD = moment(tDate + ' ' + time).toDate();

        this.state = {
            loading: false,
            tableloading: false,
            websites: [] as any,
            selectedWebsite: [] as any,
            TotalDays: [],
            websiteId: 0,
            fromDate: fDate as any,
            toDate: tDate as any,
            dayWiseReport: [] as any,
            hoursWiseReport: [] as any,
            userWiseReport: [] as any,
            chatResponseReport: [] as any,
            firstIndex: [] as any,
            firstId: 0,
            BtnDisabled: true,
        };
    }


    handleFromDate = (value) => {
        this.setState({
            fromDate: value.target.value,
        } as reportComponentState)
    }

    handleToDate = (value) => {
        this.setState({
            toDate: value.target.value,
        } as reportComponentState)
    }

    handleWebsite = (value) => {
        this.setState({
            websiteId: value.websiteId,
            selectedWebsite: value
        } as reportComponentState)
    }

    componentDidMount() {
        let TempArray = [{ id: 2, name: "temp" }]
        this.setState({
            websites: TempArray,
        } as reportComponentState)

        this.ServiceCalls();
    }




    getDates = (fromDate, toDate) => {
        var dateArray = [] as any;
        var currentDate = moment(fromDate);
        var stopDate = moment(toDate) as any;
        while (currentDate <= stopDate) {
            dateArray.push(moment(currentDate).format('DD-MMM'))
            currentDate = moment(currentDate).add(1, 'days');
        }
        return dateArray;
    }

    ServiceCalls = async () => {
        this.setState({
            loading: true,
            tableloading: true
        });

        let UserData = ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse);

        var response = await wglcsApiService.getwebsitesbyempCompany(UserData?.userLoginData?.empCompId);
        var orderByWebsite = _.orderBy(response?.data?.data, ['domainName'], ['asc']);
        this.setState({
            websites: orderByWebsite,
            loading: false,
            BtnDisabled: false,
            selectedWebsite: orderByWebsite[0] as any,
            firstIndex: orderByWebsite[0] as any,
            websiteId: orderByWebsite[0]?.websiteId,
            firstId: orderByWebsite[0]?.websiteId,
        } as reportComponentState);

        await this.filterData();
    }


    WebsiteOptionTemplate = (option) => {
        if (this.state.loading) {
            return (
                <div className="spinner-div"><ProgressSpinner style={{ width: '50px', height: '50px', backgroungColor: "red" }} strokeWidth="3" fill="#EEEEEE" animationDuration=".5s" /></div>
            )
        }

        if (option) {
            return (
                <div className="country-item">
                    <div>{option.domainName}</div>
                </div>
            );
        }
    }



    filterData = async () => {

        if (this.state.websiteId > 0) {
            this.setState({
                tableloading: true
            });

            const body = {
                fromDate: this.state.fromDate,
                toDate: this.state.toDate,
                websiteId: this.state.websiteId?.toString()
            }
            let useriseResponse = await wglcsApiService.depdashboard_websitestats_userwise(body);
            let hourswiseResponse = await wglcsApiService.depdashboard_websitestats_hourwise(body);
            let daywiseResponse = await wglcsApiService.depdashboard_websitestats_daywise(body);
            let depdashboardwebsitestats_comanaged = await wglcsApiService.depdashboardwebsitestats_comanaged(body);


            this.setState({
                userWiseReport: useriseResponse?.data!.data as any,
                hoursWiseReport: hourswiseResponse?.data!.data as any,
                dayWiseReport: daywiseResponse?.data!.data as any,
                chatResponseReport: depdashboardwebsitestats_comanaged?.data!.data as any,
                tableloading: false
            } as reportComponentState);
        }
    }


    Clear = async () => {
        this.setState({
            tableloading: true
        })
        await this.handleState();
        this.filterData()
    }

    handleState = () => {
        var fDate = moment(new Date().setDate(new Date().getDate() - 5)).format('YYYY-MM-DD');
        var tDate = moment(new Date().setDate(new Date().getDate() - 1)).format('YYYY-MM-DD');
        this.setState({
            websiteId: this.state.firstId,
            fromDate: fDate as any,
            toDate: tDate as any,
            selectedWebsite: this.state.firstIndex,
        }, () => { })
    }

    render() {
        return (
            <div className="p-grid view-report">
                <div className="p-col-6 home-resources">
                    <h6><Link to="/">Home</Link><span> / Dashboard</span></h6>
                    <div className="resources-heading"> <h1>Dashboard</h1></div>
                </div>
                <div className="p-col-6"></div>

                <div className="col-12 col-md-4 py-2 py-md-0 report">
                    <label htmlFor="basic">Website</label>
                    <Dropdown className="form-control" filter filterBy="domainName" style={{ display: "flex" }} value={this.state.selectedWebsite} options={this.state.websites} itemTemplate={this.WebsiteOptionTemplate} onChange={(e) => this.handleWebsite(e.target.value)} optionLabel="domainName" placeholder="Select Website" />
                </div>

                <div className="col-12 col-md-4 py-2 py-md-0 report">
                    <label htmlFor="basic">From</label><br />
                    <input className="p-inputtext" type="date" placeholder="From Date" data-date="" data-date-format="MM-DD-YYYY" value={this.state.fromDate as any} onChange={(e) => this.handleFromDate(e)} />

                    {/* <Calendar value={this.state.fromDate} onChange={(e) => this.handleFromDate(e)} id="basic"  /> */}
                </div>

                <div className="col-12 col-md-4 py-2 py-md-0 report">
                    <label htmlFor="basic">To</label><br />
                    <input className="p-inputtext" type="date" placeholder="To Date" data-date="" data-date-format="MM-DD-YYYY" value={this.state.toDate as any} onChange={(e) => this.handleToDate(e)} />
                </div>

                <div className="col-12 py-3">
                    <div style={{ float: "right", }} >
                        <Button className="search-btn" disabled={this.state.BtnDisabled} style={{ marginRight: "5px" }} onClick={this.filterData}>Search</Button>
                        <Button className="clear-btn" disabled={this.state.BtnDisabled} onClick={(e) => { this.Clear() }}>Clear</Button>
                    </div>
                </div>

                {this.state.tableloading === true ? (
                    <div className="p-col-12 p-md-12 p-lg-12 p-sm-12 p-xs-12">
                        <Card>
                            <div className="spinner-TBLdiv"><ProgressSpinner style={{ width: '70px', height: '70px', backgroungColor: "red" }} strokeWidth="3" fill="#EEEEEE" animationDuration=".5s" /></div>
                        </Card>
                    </div>
                ) : (
                    <>
                        <div className="p-col-12 p-md-6 p-lg-6 p-sm-12 p-xs-12">
                            <Card>
                                <div className="p-grid">
                                    <div className="p-col-1 p-md-1 p-lg-1 p-sm-1 p-col-align-center">
                                        <h6 className="verticle">Chats</h6>
                                    </div>
                                    <div className="p-col-11 p-md-11 p-lg-11 p-sm-11">
                                        <TotalChats loading={this.state.tableloading} data={this.state.dayWiseReport} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="p-col-12 p-md-6 p-lg-6 p-sm-12 p-xs-12">
                            <Card>
                                <div className="p-grid">
                                    <div className="p-col-1 p-md-1 p-lg-1 p-sm-1 p-col-align-center">
                                        <h6 className="verticle">Minutes</h6>
                                    </div>
                                    <div className="p-col-11 p-md-11 p-lg-11 p-sm-11">
                                        <TotalDuration loading={this.state.tableloading} data={this.state.dayWiseReport} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="p-col-12 p-md-6 p-lg-6 p-sm-12 p-xs-12">
                            <Card>
                                <ChatResponseTime loading={this.state.tableloading} data={this.state.chatResponseReport} />
                            </Card>
                        </div>

                        <div className="p-col-12 p-md-6 p-lg-6 p-sm-12 p-xs-12">
                            <Card>
                                <TotalAgentsChat loading={this.state.tableloading} data={this.state.userWiseReport} />
                            </Card>
                        </div>

                        <div className="p-col-12 p-md-6 p-lg-6 p-sm-12 p-xs-12">
                            <Card>
                                <div className="p-grid">
                                    <div className="p-col-1 p-md-1 p-lg-1 p-sm-1 p-col-align-center">
                                        <h6 className="verticle">Hours</h6>
                                    </div>
                                    <div className="p-col-11 p-md-11 p-lg-11 p-sm-11">
                                        <ChatAvailability loading={this.state.tableloading} dayWiseReportData={this.state.dayWiseReport} data={this.state.hoursWiseReport} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        )
    }
}
export default reportComponent;
