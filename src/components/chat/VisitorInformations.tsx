import React from "react";
import moment from 'moment';
import { LoginResponse, VisitorChatHistory, VisitorInitData, VisitorIpInformation } from "../../models";
import { VisitorData } from '../../models/index';
import { wglcsApiService } from "../../services/WglcsApiService";
import Spinner from "./../../components/spinner/spinner";
import EventEmitter from '../../services/eventemitter';
import { Events } from '../../models/events';
import { URL, getTime } from '../../constants/urlChecker ';

interface VisitorInformationProps {
    visitorData: VisitorData;
    visitorInitData: VisitorInitData;
}

interface VisitorInformationState {
    visitorChatHistory: VisitorChatHistory[];
    visitorIpInformation: VisitorIpInformation | null;
    isOpen: boolean;
    openMessages: boolean;
    previousChat: VisitorChatHistory | null;
    loading: boolean;
}

class VisitorInformationComponent extends React.Component<VisitorInformationProps, VisitorInformationState> {

    constructor(props) {
        super(props);

        this.state = {
            visitorChatHistory: [],
            visitorIpInformation: null,
            isOpen: false,
            openMessages: false,
            previousChat: null!,
            loading: false
        };
    }

    componentWillReceiveProps(nextProps: VisitorInformationProps) {
        if ((this.props.visitorInitData?.Info?.VisitorID != nextProps.visitorInitData?.Info?.VisitorID && nextProps.visitorInitData?.Info?.VisitorID != undefined)) {
            this.loadVisitorInformation(nextProps.visitorInitData.Info.VisitorID);
        }
    }

    loadVisitorInformation = async (visitorId: String) => {

        this.setState({
            loading: true
        });
        var result = await wglcsApiService.getvisitoripinformation(visitorId);
        var visitorIpInformation = result?.data?.data ?? [];

        var chatHistoryByVisitor = await wglcsApiService.getchathistorybyvisitor(visitorId);
        var visitorChatHistory = chatHistoryByVisitor.data!.data;

        this.setState({
            loading: false,
            visitorIpInformation: visitorIpInformation.length > 0 ? visitorIpInformation[0] : null,
            visitorChatHistory: visitorChatHistory
        });

        EventEmitter.emit(Events.onVisitorIpInformationLoaded, visitorIpInformation);
    }

    showMessages = () => {
        if (this.state.previousChat?.conversation.length == 0) {
            return (<text>No message to display</text>)
        } else {
            var expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;

            return (
                <div style={{ float: 'none' }}>
                    {this.state.previousChat?.conversation.map((item, i) => {
                        var matches = item.messageText.match(expression);
                        if (item.userId == 0) {
                            return (<div className="outgoing_msg" key={item.chatId + "" + i}>
                                <p className="time_date_history ">visitor{this.props?.visitorData?.visitorid} at {new Date(item.timeStamp).toLocaleTimeString()}</p>
                                {/* <div className="incoming_msg_img">
                                    <img className={'height_msg_img'} src="https://i.pinimg.com/originals/c2/04/47/c20447b5f198eabf85ee78b482dbc633.jpg" alt="sunil" />
                                </div> */}
                                <div className="received_withd_msg">

                                    {matches ? <p>{URL.urlCheck(item.messageText)}</p> : <p>{item.messageText}</p>}
                                    <span className="time_date"></span>
                                </div>
                            </div>)
                        } else {
                            return (<div className="incoming_msg" key={i} >
                                {/* <div className="incoming_msg_img">
                                    <img className={'height_msg_img'} src="https://i.pinimg.com/originals/c2/04/47/c20447b5f198eabf85ee78b482dbc633.jpg" alt="sunil" />
                                </div> */}
                                <p className="time_date_history ">{item.userName} at {new Date(item.timeStamp).toLocaleTimeString()}</p>
                                <div className="sent_msgd">
                                    <div className="sent_msg">

                                        {matches ? <p>{URL.urlCheck(item.messageText)}</p> : <p>{item.messageText}</p>}
                                        <span className="time_date"></span>
                                    </div>
                                </div>
                            </div>)
                        }
                    })}
                </div>
            )
        }
    }

    time = (val) => {
        const duration = moment.duration(val, 'seconds');
        const h = duration.hours();
        const m = duration.minutes();
        const s = duration.seconds();
        return h + ":" + m + ":" + s
    }
    calculateLength = () => {

        if (this.state.visitorIpInformation?.city_name) {
            if ((this.state.visitorIpInformation.city_name.length + this.state.visitorIpInformation.country_name.length) > 15) {
                return 'text-style text-length';
            }
            else return 'text-style';
        }

    }
    render() {

        const looding = this.state.loading;
        if (looding) {
            return (<Spinner />)
        } else {
            return (
                <div className={`card-body  bg-color-white ${(this.state.isOpen || this.state.openMessages) ? "visitorInfo_cursor_margin" : "visitorInfo_cursor"} `}>
                    <div className="row">
                        <div className="col-6  mb-1 b-1">
                            <div className="card blue-box text-white shadow p-1 card-box" >
                                <i className="fal fa-comments-alt"></i>
                                <div className="card-body b-1" onClick={() => { this.setState({ isOpen: true }) }}>
                                    <span className="text-style">{Number(this.props.visitorInitData?.Info.PreviousChats) - 1 ?? 0}<br />Previous Chats</span>
                                </div>
                                {(this.state.isOpen && !this.state.openMessages) &&
                                    <div className="blue-box-hover">
                                        <h6 className="m-0 ml-0 mb-1 font-weight-bold pull-left w-100">Previous Chats </h6>
                                        {/* <h6 className="m-0 ml-0 mb-1 font-weight-bold pull-left w-100">dadad</h6> */}
                                        <ul className="chat-history">
                                            {/* {this.state.visitorChatHistory.map((item, i) =>
                                                <li onClick={() => { this.setState({ openMessages: true, previousChat: item }) }} key={i} className={i % 2 == 0 ? "odd-row" : "even-row"}>
                                                    Chat ID: {(i % 2 == 0) + " " + i}{item.chatId}
                                                    <span className="ml-2">{item.timeStamp}
                                                    </span>
                                                </li>
                                            )} */}

                                            {this.state.visitorChatHistory.map((item, i) => {

                                                let dataTime = (item.timeStamp as any).split('T');
                                                var dateFormatChange = dataTime[0].split('-');
                                                dateFormatChange = dateFormatChange[1] + '/' + dateFormatChange[2] + '/' + dateFormatChange[0];
                                                let daynight = dataTime[1].split(':')[0] >= 12 ? 'PM' : 'AM';
                                                let hoursFormat = dataTime[1].split(':')[0] % 12 || 12;
                                                let splittime = dataTime[1].replace(/\.\d+/, "")
                                                splittime = splittime.split(':');


                                                let finalTime = hoursFormat + ':' + splittime[1] + ':' + splittime[2];

                                                return (
                                                    <li onClick={() => { this.setState({ openMessages: true, previousChat: item }) }} key={i} className={i % 2 == 0 ? "odd-row" : "even-row"}>
                                                        CHAT ID:{item.chatId}
                                                        {'  ' + dateFormatChange + '  ' + finalTime + ' ' + daynight}
                                                    </li>

                                                )
                                            })}

                                            <div className="alert-close" onClick={() => this.setState({ isOpen: false })}> × </div>
                                        </ul>
                                    </div>}
                                {(this.state.isOpen && this.state.openMessages) &&
                                    <div className="blue-box-hover">
                                        <h6 className="m-0 ml-0 mb-1 font-weight-bold pull-left w-100">Previous Chats </h6>
                                        <div style={{ flexDirection: 'row', display: 'flex', alignItems: 'flex-start', border: '1px solid white', height: '20px' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '12px' }}>CHAT ID:</p>
                                            <p style={{ fontSize: '12px' }}>{this.state.previousChat?.chatId}</p>
                                        </div>
                                        <ul className="chat-history">
                                            {this.showMessages()}
                                            <div className="alert-close" onClick={() => { this.setState({ openMessages: false }) }}> × </div>
                                        </ul>
                                    </div>}
                            </div>
                        </div>
                        <div className="col-6 mb-1 b-1">
                            <div className="card green-box text-white shadow p-1 card-box">
                                <i className="fal fa-stopwatch"></i>
                                <div className="card-body b-1">
                                    <span className="text-style">{this.props.visitorData != null ? this.time(this.props.visitorData.time) : ''}<br />Duration on Site</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 mb-1 b-1">
                            <div className="card yellow-box text-white shadow p-1 card-box ">
                                <i className="fal fa-clock"></i>
                                <div className="card-body b-1">
                                    <span className="text-style">{this.props.visitorInitData?.Info?.PreviousVisits ?? 0}<br />Previous Visits</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-6 mb-1 b-1">
                            <div className="card red-box text-white shadow p-1 card-box">
                                <i className="fal fa-map-marker-alt" aria-hidden="true"></i>
                                <div className="card-body b-1">
                                    <span style={{fontSize: '13px'}}  title={`${this.state.visitorIpInformation?.city_name}, ${this.state.visitorIpInformation?.country_name}`}><span className={this.calculateLength()}><br/></span>{(this.state.visitorIpInformation?.city_name ? `${this.state.visitorIpInformation?.city_name}, ${this.state.visitorIpInformation?.country_name.length>13?this.state.visitorIpInformation?.country_name.slice(0,15)+'...':this.state.visitorIpInformation?.country_name}` : '[Location Pending]')}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            )
        }
    }
};

export default VisitorInformationComponent;