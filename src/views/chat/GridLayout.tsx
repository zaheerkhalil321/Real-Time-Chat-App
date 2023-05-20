//@ts-nocheck
import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";

import { Strophe, $pres } from 'strophe.js';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export default class ShowcaseLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentBreakpoint: "lg",
            compactType: "vertical",
            mounted: false,
            variablesForChat: false,
            typeMsg: '',
            conversation: [{
                to: '',
                sent_msg: true,
                message: 'Test, which is a new approach to hav',
                time: '11:01 AM    |    Yesterday',
            }],
            layouts: {
                lg: [
                    { i: 'a', x: 0, y: 0, w: 7, h: 3, minW: 4.7, minH: 2.5 },
                    { i: 'b', x: 7, y: 0, w: 3, h: 2, minW: 2, minH: 2 },
                    { i: 'c', x: 7, y: 2, w: 3, h: 1, minW: 2, minH: 1 },
                    { i: 'd', x: 7, y: 3, w: 3, h: 1, minW: 2, minH: 1 },
                    { i: 'e', x: 7, y: 4, w: 3, h: 2, minW: 2, minH: 1 },
                    { i: 'f', x: 7, y: 5, w: 3, h: 1, minW: 2, minH: 1 },
                    { i: 'g', x: 0, y: 1, w: 7, h: 4, minW: 4, minH: 2, maxH: 4 }
                ]
            }
        };
        this.messagesEndRef = React.createRef();
        this.onBreakpointChange = this.onBreakpointChange.bind(this);
        this.onCompactTypeChange = this.onCompactTypeChange.bind(this);
        this.onLayoutChange = this.onLayoutChange.bind(this);

    }
    stropheConnection() {

        let variablesForChat = new Strophe.Connection('http://thechatsoftware.com/http-bind/', { 'mechanisms': [Strophe.SASLPlain] } as any);



        variablesForChat.connect(this.props.userId + "@localhost/LiveAdminsChat", "welcome", (status, r) => {

            this.setState({ status: status, variablesForChat: variablesForChat })
            this.onConnect(variablesForChat, status)
        }, undefined, undefined, "xmpp:localhost:5225")
    }

    onConnect(variablesForChat: any, status: any) {
        let that = this
        if (status === Strophe.Status.CONNECTED) {
            console.log('Strophe is connected.........');
            variablesForChat.send($pres());

            variablesForChat.addHandler(function (msg) {
                console.log(msg, "conference"); // con list
                // that.reMessage(msg)


            }, 'jabber:x:conference');
            variablesForChat.addHandler(function (msg) {
                console.log(msg, "message"); // con list

                that.reMessage(msg)
            }, null, 'message', null, null, null);
            // First, you must send a <presence> to the server (initial presence), this step must be done, otherwise the server does not know what you want to do
        } else if (status === Strophe.Status.DISCONNECTED) {
            console.log("disconnected");
        }
        if (status == Strophe.Status.CONNECTING) {
            console.log("CONNECTING");
        }
        else if (status == Strophe.Status.CONNFAIL) {
            console.log("CONNFAIL");
        }
        else if (status == Strophe.Status.DISCONNECTING) {
            console.log("DISCONNECTING");
        }
        else if (status == Strophe.Status.DISCONNECTED) {
            console.log("DISCONNECTED");

        } else if (status == Strophe.Status.AUTHENTICATING) {
            console.log("AUTHENTICATING");
        }
        else if (status == Strophe.Status.AUTHFAIL) {
            console.log("AUTHFAIL");
        }
        else if (status == Strophe.Status.ERROR) {
            console.log("ERROR");
        }
    }

    sendText(connection: any, msg: any) {
        var val = msg ? msg : "hi hammad";//Text content to be sent
        var o = { to: this.state.to, type: 'groupchat' };
        var m = $msg(o); m.c('body', null, msg);
        connection.send(m.tree());

        let obj = this.state.conversation
        obj.push({
            to: connection.sendTojid,
            sent_msg: true,
            message: val,
            time: '11:01 AM    |    Yesterday',
        })
        this.setState({ conversation: obj, typeMsg: '' })
        console.log(m.tree(), "send", this.state.from);
        // Create a <message> element and send  
        // var msg = $msg({
        //     to: this.state.to,
        //     chat_id: this.state.chatId,
        //     custom_packet: true,
        //     user_id: 7402,
        //     manager_id: 7402,
        //     time_stamp: '2020-10-12 15:10:59',
        //     website_id: 11004,
        //     visitor_name: 'Hammad',
        //     type: "groupchat"
        // }).c("body", { xmlns: Strophe.NS.CLIENT }, val);
        // connection.send(msg.tree());

        // connection.send($msg({ to: this.state.from, from: connection.jid}).c('x', 
        // { xmlns: 'jabber:x:conference', jid: this.state.from+"@conference.localhost"}).tree());
    }

    reMessage(msg: any) {


        // variablesForChat.connection.send($msg({
        //     to: variablesForChat.room,
        //     chat_id: variablesForChat.chatId,
        //     custom_packet: true,
        //     user_id: 0,
        //     manager_id: 0,
        //     time_stamp: myUTCDateString(currentTime),
        //     website_id: variablesForChat.websiteId,
        //     visitor_name: variablesForChat.visitorName,
        //     type: "groupchat"
        // }).c("body").t(e))

        ////////
        var to = msg.getAttribute('from');
        var from = msg.getAttribute('to');
        var elems = msg.getElementsByTagName("*");
        var fromInvite = elems[1].getAttribute('from')
        console.log(msg, "reMessage", from, fromInvite, elems)
        var str = to;
        var n = str.indexOf("@conference");
        var s = str.indexOf("room");

        var resTo = str.substring(0, n);
        var chatId = str.substring(4, n);

        var connection = this.state.variablesForChat

        var o = { to: to + "/youNick" };
        var m = $pres(o);
        m.c('x', { xmlns: 'http://jabber.org/protocol/muc#user' }, null);
        connection.send(m.tree());

        console.log(m.tree(), "7402", to)
        let obj = this.state.conversation
        obj.push({
            to: from,
            sent_msg: false,
            message: from,
            time: '11:01 AM    |    Yesterday',
        })

        this.setState({ conversation: obj, from: from, to: to, chatId: chatId })
        return true;
        // var msg = $msg({
        //     to: to,
        //     chat_id: chatId,
        //     custom_packet: true,
        //     user_id: 7402,
        //     manager_id: 7402,
        //     time_stamp: '2020-10-12 15:10:59',
        //     website_id: 11004,
        //     visitor_name: 'Hammad',
        //     type: "groupchat"
        // }).c("body").t("hello")
        //emd
        //  $msg({ to: to, from: from,  custom_packet: true, user_id: 7402,
        //     manager_id: 7402})
        //     .c('x', { xmlns: 'jabber:x:conference', jid: fromInvite }).tree();
    }

    componentDidMount() {
        this.stropheConnection()

        this.setState({ mounted: true });
    }



    onBreakpointChange(breakpoint) {
        this.setState({
            currentBreakpoint: breakpoint
        });
    }

    onCompactTypeChange() {
        const { compactType: oldCompactType } = this.state;
        const compactType =
            oldCompactType === "horizontal"
                ? "vertical"
                : oldCompactType === "vertical"
                    ? null
                    : "horizontal";
        this.setState({ compactType });
    }

    onLayoutChange(layout, layouts) {
        // this.props.onLayoutChange(layout, layouts);
    }

    componentDidUpdate() {
        this.messagesEndRef.scrollTop = this.messagesEndRef.scrollHeight;//scrollIntoView({ behavior: "smooth" });
    }

    updatebreakendtime = () => {
        fetch('https://cors-anywhere.herokuapp.com/https://blue.thelivechatsoftware.com/ChatAppApi/api/wglcs/updatebreakendtime', {
            "method": "POST",
            "headers": new Headers({
                'access-token': 'pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S',
                "Authorization": 'Bearer ' + this.props.auth_token,
                'Content-Type': 'application/json-patch+json',
                'accept': 'text/plain',
                'api-version': 'v1'
            }),

            "body": JSON.stringify({
                "breakId": this.state.UserBreakId
            })
        })
            .then(response => response.json())
            .then(response => {

                this.setState({ break: false })
            })
            .catch(err => {
                console.log(err);
            });
    }
    render() {
        const { conversation } = this.state
        return (
            <div>
                <ResponsiveReactGridLayout
                    layouts={this.state.layouts}
                    onBreakpointChange={this.onBreakpointChange}
                    onLayoutChange={this.onLayoutChange}
                    // WidthProvider option
                    measureBeforeMount={false}
                    // I like to have it animate on mount. If you don't, delete `useCSSTransforms` (it's default `true`)
                    // and set `measureBeforeMount={true}`.
                    useCSSTransforms={this.state.mounted}
                    compactType={this.state.compactType}
                    preventCollision={!this.state.compactType}>
                    { /* #H main chat */}
                    <div key='a' className="card chat-window mesgs" ref={(ref) => this.messagesEndRef = ref}>

                        {conversation.map((data, i) => {
                            if (data.sent_msg) {
                                return (<div className="outgoing_msg" key={i}>

                                    <div className="outgoing_msg_img">
                                        <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil" /> </div>
                                    <div className="sent_msg">
                                        <p>{data.message}</p>
                                        <span className="time_date"> {data.time}</span>
                                    </div>

                                </div>)
                            } else {
                                return (<div className="incoming_msg" key={i}  >
                                    <div className="incoming_msg_img"> <img src="https://ptetutorials.com/images/user-profile.png" alt="sunil" /> </div>
                                    <div className="received_msg">
                                        <div className="received_withd_msg">
                                            <p>{data.message}</p>
                                            <span className="time_date"> 11:01 AM    |    Yesterday</span>
                                        </div>
                                    </div>
                                </div>)
                            }
                        })}

                    </div>


                    { /* #H  Visitor Information --> */}
                    <div className="card shadow  mb-4 visit-info controlOverflow" key='b'>
                        { /* <!-- Card Header  --> */}
                        <div className="card-header v-info d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold pull-left">Visitor Information</h6>
                        </div>
                        { /* <!-- Card Body --> */}
                        <div className="card-body  bg-color-white">
                            <div className="row">
                                <div className="col-lg-6  mb-1 b-1">
                                    <div className="card blue-box text-white shadow p-1">
                                        <i className="fal fa-comments-alt"></i>
                                        <div className="card-body b-1">
                                            <span className="text-style">25<br />Previous Chats</span>

                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb-1 b-1">
                                    <div className="card green-box text-white shadow p-1">
                                        <i className="fal fa-stopwatch"></i>
                                        <div className="card-body b-1">
                                            <span className="text-style">12:21<br />Chat Duration   </span>

                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb-1 b-1">
                                    <div className="card yellow-box text-white shadow p-1">
                                        <i className="fal fa-clock"></i>
                                        <div className="card-body b-1">
                                            <span className="text-style">13:22<br />Local Time</span>

                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-6 mb-1 b-1">
                                    <div className="card red-box text-white shadow p-1">
                                        <i className="fal fa-map-marker-alt" aria-hidden="true"></i>
                                        <div className="card-body b-1">
                                            <span className="text-style">Ajman<br />United Location</span>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    { /* #H  live-info-card --> */}
                    <div className="card live-info-card controlOverflow" key='c'>
                        { /* <!-- Card content --> */}
                        <div className="card-body live-card-info card-content pb-0">
                            <div className="d-flex justify-content-between mb-1">
                                <p><i className="fas l-info fal fa-window-alt fa-lg text-info pr-2"></i>https://www.google.com</p>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <p><i className="fas l-info fal fa-link fa-lg text-info pr-2"></i>https://dxh.ae</p>

                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <p><i className="fas l-info fal fa-clock fa-lg grey-text pr-2"></i>11/18/2019 - 1:05:37PM</p>
                            </div>
                            <div className="d-flex justify-content-between mb-1">
                                <p><i className="fas l-info fal fa-clock fa-lg grey-text pr-2"></i>11/18/2019 - 1:05:37PM</p>
                            </div>
                        </div>
                    </div>

                    { /* <!-- system-info --> */}

                    <div className="card system-info-card controlOverflow" key='d'>
                        <div className="card-body pb-0">
                            <div className="d-flex justify-content-between mb-1">
                                <div className="card-block">
                                    <h2><i className="fal fa-desktop"></i></h2>
                                    <h4 className="card-title">Desktop</h4>

                                </div>
                                <div className="card-block">
                                    <h2><i className="fab fa-windows"></i></h2>
                                    <h4 className="card-title">Windows 10</h4>
                                </div>
                                <div className="card-block">
                                    <h2><i className="fab fa-chrome"></i></h2>
                                    <h4 className="card-title">Chrome</h4>
                                </div>
                                <div className="card-block">
                                    <h2><i className="fal fa-map-marker"></i></h2>
                                    <h4 className="card-title">94.201.37.2</h4>
                                </div>
                            </div>
                        </div>
                    </div>

                    { /* #H <-/ Click Path */}
                    <div className="card quick-links-card controlOverflow" key='e'>
                        <div className="card-header d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold pull-left">Click Path</h6>
                        </div>
                        { /* <!-- Card content --> */}
                        <div className="card-body p-3 d-flex flex-column">
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                            <a href="">https://www.dxh.ae</a>
                        </div>
                    </div>

                    { /* buttons tabs */}
                    <div className="card tabs bttns-tabs controlOverflow" key='f'>
                        <ul id="" className="nav nav-tabs btns-tab" role="tablist">
                            <li>
                                <button type="button" className="btn btn-default  btn-xs info-btns nav-item nav-link active" data-toggle="tab" role="tab" aria-selected="true" href="#visitor-info">
                                    <span className="fa fa-exclamation-circle info-icons" aria-hidden="true"></span> Visitor Info
                                </button>
                                {/* <a className="nav-item nav-link active" data-toggle="tab" role="tab" aria-selected="false" href="#visitor-info">Visitor Info</a> */}
                            </li>
                            <li>
                                <button type="button" className="btn btn-default btn-xs info-btns nav-item nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#chat-transcript">
                                    <span className="fas fa-file-alt info-icons" aria-hidden="true"></span> Chat Transcript
                                </button>
                                {/* <a className="nav-item nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#chat-transcript">Chat Transcript</a> */}

                            </li>
                            <li>
                                <button type="button" className="btn btn-default btn-xs info-btns nav-item nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#file-support">
                                    <span className="fa fa-exclamation-circle info-icons" aria-hidden="true"></span> File Support
                                </button>
                                {/* <a className="nav-item nav-link" data-toggle="tab" role="tab" aria-selected="true" href="#file-support">File Support</a> */}

                            </li>
                        </ul>


                    </div>

                    { /* #H Canned Messages */}

                    <div className="card tabs controlOverflow" key='g'>
                        <ul id="tab-button" className="nav nav-tabs" role="tablist">
                            <li><a className="nav-item nav-link active" data-toggle="tab" role="tab" aria-selected="false" href="#website-canned-messages">Website Canned</a></li>
                            <li><a className="nav-item nav-link " data-toggle="tab" role="tab" aria-selected="false" href="#personal-canned-messages">Personal Canned</a></li>
                            <li><a className="nav-item nav-link" data-toggle="tab" role="tab" aria-selected="true" href="#canned-messages">Push Content</a></li>
                        </ul>


                        <div className="tab-content c-msgs px-0">

                            { /* <!-- Personal Canned Messages --> */}
                            <div id="website-canned-messages" className="tab-pane fade  show active" role="tabpanel" >
                                <div id="personal-canned-messages" className="tab-pane" role="tabpanel" >
                                    <div className="card shadow mb-4">
                                        {/* <div className="card-header py-3">
                                        <h6 className="m-0 font-weight-bold text-primary">Personal Canned Messages</h6>
                                    </div> */}
                                        <div className="card-body p-c-msg">
                                            { /* <!-- Actual search box --> */}
                                            <div className="form-group has-search">
                                         
                                                <span className="fa fa-repeat form-control-feedback"></span>
                                                <input type="text" className="form-control" />
                                            </div>
                                            <div className="personal-msgs">
                                                <ul>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                    <li>Hi, How can i help you?</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                { /* <!-- Personal Canned Messages --> */}


                                { /* <!-- Illustrations --> */}
                                <div className="card shadow mb-4">
                                    {/* <div className="card-header py-3">
                                        <h6 className="m-0 font-weight-bold text-primary">Website Canned Messages</h6>
                                    </div> */}
                                    <div className="card-body p-c-msg">
                                        { /* <!-- Actual search box --> */}
                                        <div className="form-group has-search">
                                            <span className="fa fa-search form-control-feedback"></span>
                                            <input type="text" className="form-control" />
                                        </div>
                                        <div className="personal-msgs">
                                            <ul>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                                <li>Hi, How can i help you?</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            { /* <!-- Canned Messages --> */}
                            <div id="canned-messages" className="tab-pane fade" role="tabpanel">
                                <div className="card shadow">
                                    {/* <div className="card-header py-3">
                                        <h6 className="m-0 font-weight-bold text-primary">Canned Messages</h6>
                                    </div> */}
                                    <div className="card-body p-c-msg">
                                        { /* <!-- Actual search box --> */}
                                        <div className="form-group has-search">
                                            <span className="fa fa-search form-control-feedback"></span>
                                            <input type="text" className="form-control" />
                                        </div>
                                        <div id="accordion" className="personal-msgs">
                                            <div className="card">
                                                <div className="card-header">
                                                    <ul>
                                                        <li className="main-msg">
                                                            <a className="card-link" data-toggle="collapse" data-parent="#accordion" href="#collapseOne">
                                                                Dr. Abdullah Qasim, he doesn't work in Al Zahra Hospital Dubai any longer. DXH website
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div id="collapseOne" className="collapse">
                                                    <div className="card-body">
                                                        <ul>
                                                            <li>DXH Guide Link who want to chat in Arabic</li>
                                                            <li>You might dont get the phone number in case of a returning visitor so you may always ask for that</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <div className="card-header">
                                                    <ul>
                                                        <li className="main-msg">
                                                            <a className="collapsed card-link" data-toggle="collapse" data-parent="#accordion" href="#collapseThree">
                                                                Visitor Aska about the other platforms for communication
                                                            </a>
                                                        </li>
                                                    </ul>

                                                </div>
                                                <div id="collapseThree" className="collapse">
                                                    <div className="card-body">
                                                        <ul>
                                                            <li>DXH Guide Link who want to chat in Arabic</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <div className="card-header">
                                                    <ul>
                                                        <li className="main-msg">
                                                            <a className="collapsed card-link" data-toggle="collapse" data-parent="#accordion" href="#collapsefour">
                                                                Test
                                                            </a>
                                                        </li>
                                                    </ul>

                                                </div>
                                                <div id="collapsefour" className="collapse">
                                                    <div className="card-body">
                                                        <ul>
                                                            <li>DXH Guide Link who want to chat in Arabic</li>
                                                            <li>Use this when someone assumes we are a facility /  Location</li>
                                                            <li>You might dont get the phone number in case of a returning visitor so you may always ask for that</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <div className="card-header">
                                                    <ul>
                                                        <li className="main-msg">
                                                            <a className="collapsed card-link" data-toggle="collapse" data-parent="#accordion" href="#collapsefive">
                                                                Just Test
                                                            </a>
                                                        </li>
                                                    </ul>

                                                </div>
                                                <div id="collapsefive" className="collapse">
                                                    <div className="card-body">
                                                        <ul>
                                                            <li>DXH Guide Link who want to chat in Arabic</li>
                                                            <li>Use this when someone assumes we are a facility /  Location</li>
                                                            <li>You might dont get the phone number in case of a returning visitor so you may always ask for that</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <div className="card-header">
                                                    <ul>
                                                        <li className="main-msg">
                                                            <a className="collapsed card-link" data-toggle="collapse" data-parent="#accordion" href="#collapsesix">
                                                                Link who want to chat in Arabic
                                                            </a>
                                                        </li>
                                                    </ul>
                                                </div>
                                                <div id="collapsesix" className="collapse">
                                                    <div className="card-body">
                                                        <ul>
                                                            <li>DXH Guide Link who want to chat in Arabic</li>
                                                            <li>Use this when someone assumes we are a facility /  Location</li>
                                                            <li>You might dont get the phone number in case of a returning visitor so you may always ask for that</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="card">
                                                <div className="card-header">
                                                    <ul>
                                                        <li className="main-msg">
                                                            <a className="collapsed card-link" data-toggle="collapse" data-parent="#accordion" href="#collapseseven">
                                                                Collapsible Group Item
                                                            </a>
                                                        </li>
                                                    </ul>

                                                </div>
                                                <div id="collapseseven" className="collapse">
                                                    <div className="card-body">
                                                        <ul>
                                                            <li>DXH Guide Link who want to chat in Arabic</li>
                                                            <li>Use this when someone assumes we are a facility /  Location</li>
                                                            <li>You might dont get the phone number in case of a returning visitor so you may always ask for that</li>
                                                        </ul>
                                                    </div>
                                                </div>

                                            </div>
                                            { /* <!-- panel-group --> */}
                                        </div>

                                    </div>
                                </div>
                                {/* <div className="type_msg">
                                    <div className="input_msg_write">
                                        <input type="text" className="write_msg" placeholder="Type a message" />
                                        <button className="msg_send_btn msg_icon_reply" type="button"><i className="fa fa-refresh" aria-hidden="true"></i></button>
                                    </div>
                                </div> */}
                            </div>


                        </div>

                    </div>


                </ResponsiveReactGridLayout>
            </div>
        );
    }
}
