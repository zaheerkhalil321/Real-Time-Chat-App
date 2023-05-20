
import React, { Component } from "react";
import { Link } from "react-router-dom";
import {
    Form,
    Media,
    Collapse,
    Navbar,
    Nav,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Modal,
    ModalHeader,
    ModalBody,
    Button,
    ModalFooter,
    FormGroup,
    Label,
    Input
} from "reactstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import EventEmitter from '../../../services/eventemitter';
import { Events } from '../../../models/events';
import { Checkbox } from 'primereact/checkbox';
import SettingModal from '../../../constants/SettingMdl';

import {
    Menu,
    MoreVertical,
    Check,
    AlertTriangle,
    Lock,
    X,
    LogOut,
    Key,
    Settings
} from "react-feather";

import { wglcsApiService } from '../../../services/WglcsApiService';
import userImage2 from "../../../assets/img/portrait/small/avatar-s-2.png";
import userImage3 from "../../../assets/img/portrait/small/avatar-s-3.png";
import userImage4 from "../../../assets/img/portrait/small/avatar-s-4.png";

import { loginService } from '../../../services/loginService';
import { LoginResponse } from "../../../models";

import { OperatorPanelRoute } from '../sidebar/sidemenu'

interface NavbarProps {
    toggleSidebarMenu: (state: string) => void,
    location: any;
    history: any
}

interface NavbarState {
    isOpen: boolean,
    userData: LoginResponse,
    isOperatorOnBreak: boolean,
    showLogoutModal: boolean;
    resetPasswordModal: boolean;
    oldPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    checked: boolean;
    stroph: number;
    settingModal: boolean;
}

class NavigationBar extends Component<NavbarProps, NavbarState> {

    IsLogIDAliveInterval!: NodeJS.Timeout;

    constructor(props) {

        super(props);
        var userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse;

        this.toggle = this.toggle.bind(this);
        this.state = {
            isOpen: false,
            userData: userData,
            isOperatorOnBreak: false,
            showLogoutModal: false,
            resetPasswordModal: false,
            oldPassword: '',
            newPassword: '',
            confirmNewPassword: '',
            checked: localStorage.getItem('unsentPopup') === 'false' ? false : true,
            stroph: 0,
            settingModal: false
        };

        EventEmitter.on(Events.stropheStatus, this.onStropheStatusChanged);
    }

    componentDidMount = async () => {
        this.IsLogIDAliveInterval = setInterval(this.IsLogIDAlive, 15000);
    }

    IsLogIDAlive = async () => {
        var logIdResult = await wglcsApiService.getIsLogIDAlive(this.state.userData.userLoginData.userLog);

        if (logIdResult.data.data == false) {
            loginService.logout("LogId is Not Alive.");
        }
    }

    async componentWillUnmount() {
        clearInterval(this.IsLogIDAliveInterval);
    }

    onStropheStatusChanged = (state) => {
        this.setState({ stroph: state })
    }

    handleClick = () => {
        this.props.toggleSidebarMenu("open");
    }

    toggle() {
        this.setState({
            isOpen: !this.state.isOpen
        });
    }

    logout() {
        loginService.logout();
        this.forceUpdate();
    }

    changeBreakStatus = () => {

        if (this.state.isOperatorOnBreak) {
            EventEmitter.emit(Events.endOperatorBreak, null!);
            this.setState({ isOperatorOnBreak: false });
        } else {
            EventEmitter.emit(Events.startOperatorBreak, null!);
            this.setState({ isOperatorOnBreak: true });
        }
    }

    updatePassword = async () => {
        const regix = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/
        if (this.state.oldPassword != '' && this.state.newPassword != '' && this.state.confirmNewPassword != '') {


            if (this.state.newPassword != this.state.confirmNewPassword) {
                alert('New Password and Confirm Password do not match.')
            }
            else {

                if (this.state.oldPassword == this.state.userData.userLoginData.userPassword) {
                    if (regix.test(this.state.newPassword)) {
                        const obj = {
                            "userId": this.state.userData.userLoginData.userId,
                            "userName": this.state.userData.userLoginData.username,
                            "newPassword": this.state.newPassword,

                        }
                        wglcsApiService.updateUserPassword(obj).then(async response => {
                            this.setState({ oldPassword: '', newPassword: '', confirmNewPassword: '', resetPasswordModal: false })

                            await localStorage.clear();
                            await window.location.reload();
                        })

                    } else {
                        alert('Password must have Minimum eight characters, at least one uppercase letter, one lowercase letter and one number!')
                    }
                } else {
                    alert('Old password you typed is incorrect. Please retype your password.')
                }
            }
        }
        else {
            alert('Please fill all fields.')
        }
    }

    settingModal = (value) => {
        this.setState({ settingModal: value })
    }

    render() {

        return (
            <Navbar className="navbar navbar-expand-lg navbar-light bg-faded">
                <div className="container-fluid px-0">
                    <div className="header-left-content">
                        <h1>WG Live Chat, Dashboard</h1>
                        <span>Good morning, {this.state.userData?.userLoginData?.username}</span>
                    </div>
                    <div className="navbar-header">

                        <Menu
                            size={14}
                            className="navbar-toggle d-lg-none float-left"
                            onClick={this.handleClick.bind(this)}
                            data-toggle="collapse"
                        />
                        <Form className="navbar-form mt-1 float-left" role="search">
                            {/* <NavbarSearch /> */}
                        </Form>
                        {/* <Moon size={20} color="#333" className="m-2 cursor-pointer"/> */}
                        <MoreVertical
                            className="mt-1 navbar-toggler black no-border float-right"
                            size={50}
                            onClick={this.toggle}
                        />
                    </div>

                    <div className="navbar-container">

                        <Collapse isOpen={this.state.isOpen} navbar>
                            {/* <div className="date-time">
                                <span className="calendar-div">
                                    <i className="fa fa-calendar"></i><span style={{ color: '#909090' }}>Today,</span> 24th June
                                </span>
                                <span className="time-div">
                                    <i className="fa fa-clock-o"></i>8:00 - 16:00
                                </span>
                                <span className="search-div">
                                   <i className="fa fa-search"></i>
                                </span>
                            </div> */}

                            <Nav className="ml-auto float-right" navbar>
                                <UncontrolledDropdown nav inNavbar className="pr-1">
                                    {/* <span className="strophe-status" style={{ background: this.state.stroph == 0 ? 'red' : this.state.stroph == 1 ? 'green' : 'yellow' }} /> */}
                                    {/* <DropdownToggle nav>
                                        <span className="notification-bell-blink" />
                                        <Bell size={21} className="notification-danger animate-shake" />
                                    </DropdownToggle> */}
                                    <DropdownMenu right className="notification-dropdown">
                                        <div className="p-2 text-center  border-bottom-grey border-bottom-lighten-2">
                                            <h6 className="mb-0 text-bold-500">Notifications</h6>
                                        </div>
                                        <PerfectScrollbar className="noti-list bg-grey bg-lighten-5">
                                            <Media className="px-3 pt-2 pb-2 media  border-bottom-grey border-bottom-lighten-3">
                                                <Media left top href="#">
                                                    <Media
                                                        object
                                                        src={userImage2}
                                                        alt="Generic placeholder image"
                                                        className="rounded-circle width-35"
                                                    />
                                                </Media>
                                                <Media body>
                                                    <h6 className="mb-0 text-bold-500 font-small-3">
                                                        Selina sent you mail
                                                        <span className="text-bold-300 font-small-2 text-muted float-right">9:00 A.M</span>
                                                    </h6>
                                                    <span className="font-small-3 line-height-2">
                                                        Cras sit amet nibh libero, in gravida nulla.
                                                    </span>
                                                </Media>
                                            </Media>
                                            <Media className="px-3 pt-2 pb-2 media  border-bottom-grey border-bottom-lighten-3">
                                                <Media left middle href="#" className="mr-2">
                                                    <span className="bg-success rounded-circle width-35 height-35 d-block">
                                                        <Check size={30} className="p-1 white margin-left-3" />
                                                    </span>
                                                </Media>
                                                <Media body>
                                                    <h6 className="mb-1 text-bold-500 font-small-3">
                                                        <span className="success">Report generated successfully!</span>
                                                        <span className="text-bold-300 font-small-2 text-muted float-right">
                                                            10:15 A.M
                                                        </span>
                                                    </h6>
                                                    <span className="font-small-3 line-height-2">
                                                        Consectetur adipisicing elit sed do eiusmod.
                                                    </span>
                                                </Media>
                                            </Media>
                                            <Media className="px-3 pt-2 pb-2 media  border-bottom-grey border-bottom-lighten-3">
                                                <Media left middle href="#" className="mr-2">
                                                    <span className="bg-warning rounded-circle width-35 height-35 d-block">
                                                        <AlertTriangle size={30} className="p-1 white margin-left-3" />
                                                    </span>
                                                </Media>
                                                <Media body>
                                                    <h6 className="mb-1 text-bold-500 font-small-3">
                                                        <span className="warning">Warning notificatoin</span>
                                                        <span className="text-bold-300 font-small-2 text-muted float-right">
                                                            11:00 A.M
                                                        </span>
                                                    </h6>
                                                    <p className="font-small-3 line-height-2">
                                                        Lorem ipsum dolor sit amet consectetur adipisicing elit sed do eiusmod tempor.
                                                    </p>
                                                </Media>
                                            </Media>
                                            <Media className="px-3 pt-2 pb-2 media  border-bottom-grey border-bottom-lighten-3">
                                                <Media left top href="#">
                                                    <Media
                                                        object
                                                        src={userImage3}
                                                        alt="Generic placeholder image"
                                                        className="rounded-circle width-35"
                                                    />
                                                </Media>
                                                <Media body>
                                                    <h6 className="mb-0 text-bold-500 font-small-3">
                                                        John started task
                                                        <span className="text-bold-300 font-small-2 text-muted float-right">5:00 P.M</span>
                                                    </h6>
                                                    <span className="font-small-3 line-height-2">
                                                        Sit amet consectetur adipisicing elit sed.
                                                    </span>
                                                </Media>
                                            </Media>
                                            <Media className="px-3 pt-2 pb-2 media  border-bottom-grey border-bottom-lighten-3">
                                                <Media left middle href="#" className="mr-2">
                                                    <span className="bg-danger rounded-circle width-35 height-35 d-block">
                                                        <X size={30} className="p-1 white margin-left-3" />
                                                    </span>
                                                </Media>
                                                <Media body>
                                                    <h6 className="mb-1 text-bold-500 font-small-3">
                                                        <span className="danger">Error notificarion</span>
                                                        <span className="text-bold-300 font-small-2 text-muted float-right">
                                                            12:15 P.M
                                                        </span>
                                                    </h6>
                                                    <span className="font-small-3 line-height-2">
                                                        Consectetur adipisicing elit sed do eiusmod.
                                                    </span>
                                                </Media>
                                            </Media>
                                            <Media className="px-3 pt-2 pb-2 media  border-bottom-grey border-bottom-lighten-3">
                                                <Media left top href="#">
                                                    <Media
                                                        object
                                                        src={userImage4}
                                                        alt="Generic placeholder image"
                                                        className="rounded-circle width-35"
                                                    />
                                                </Media>
                                                <Media body>
                                                    <h6 className="mb-0 text-bold-500 font-small-3">
                                                        Lisa started task
                                                        <span className="text-bold-300 font-small-2 text-muted float-right">6:00 P.M</span>
                                                    </h6>
                                                    <span className="font-small-3 line-height-2">
                                                        Sit amet consectetur adipisicing elit sed.
                                                    </span>
                                                </Media>
                                            </Media>
                                        </PerfectScrollbar>
                                        <div className="p-1 text-center border-top-grey border-top-lighten-2">
                                            <Link to="/">View All</Link>
                                        </div>
                                    </DropdownMenu>
                                </UncontrolledDropdown>

                                <UncontrolledDropdown nav inNavbar className="pr-1">
                                    <DropdownToggle nav>
                                        <Menu size={20} color="#fff" />
                                        {/* <img src={userImage} alt="logged-in-user" className="rounded-circle width-35" /> */}
                                    </DropdownToggle>
                                    <DropdownMenu right>
                                        <DropdownItem>
                                            <span className="font-small-3">
                                                {this.state.userData?.userLoginData?.username}
                                                {/* <span className="text-muted">(Guest)</span> */}
                                            </span>
                                        </DropdownItem>
                                        <DropdownItem divider />

                                        {/* <Link to="/pages/user-profile" className="p-0">
                                            <DropdownItem>
                                                <User size={16} className="mr-1" /> My Profile
                                           </DropdownItem>
                                        </Link>
                                        <Link to="/email" className="p-0">
                                            <DropdownItem>
                                                <Inbox size={16} className="mr-1" /> Email
                                 </DropdownItem>
                                        </Link>
                                        <Link to="/calendar" className="p-0">
                                            <DropdownItem>
                                                <Calendar size={16} className="mr-1" /> Calendar
                                 </DropdownItem>
                                        </Link> */}
                                        {/* <DropdownItem divider />
                                        <Link to="/pages/lockscreen" className="p-0">
                                            <DropdownItem>
                                                <Lock size={16} className="mr-1" /> Lock Screen
                                 </DropdownItem>
                                        </Link> */}
                                        {this.props.location.pathname == OperatorPanelRoute && <DropdownItem onClick={() => this.changeBreakStatus()}>
                                            <Lock size={16} className="mr-1" /> {this.state.isOperatorOnBreak ? "End Break" : 'Take a Break'}
                                        </DropdownItem>}
                                        <DropdownItem onClick={() => { this.setState({ resetPasswordModal: true }) }}>
                                            <Key size={16} className="mr-1" /> Change Password
                                        </DropdownItem>
                                        <DropdownItem>
                                            <Checkbox inputId="binary" checked={this.state.checked} onChange={e => { localStorage.setItem('unsentPopup', e.checked.toString()); this.setState({ checked: e.checked }) }} />
                                            <label htmlFor="binary" style={{marginLeft:'7px'}}>Unsent chat notification</label>
                                        </DropdownItem>
                                        <DropdownItem onClick={() => { this.setState({ settingModal: !this.state.settingModal }) }}>
                                            <Settings size={16} className="mr-1" /> Settings
                                        </DropdownItem>

                                        {/* <Link to="/pages/login" className="p-0"> */}
                                        <DropdownItem onClick={() => { this.setState({ showLogoutModal: true }) }}>
                                            <LogOut size={16} className="mr-1" /> Logout
                                        </DropdownItem>

                                        {/* </Link> */}
                                    </DropdownMenu>
                                </UncontrolledDropdown>
                            </Nav>
                        </Collapse>
                        <SettingModal toggle={this.settingModal} value={this.state.settingModal} />
                        {this.state.resetPasswordModal &&
                            <div className="text-center">
                                <Modal isOpen={this.state.resetPasswordModal}>
                                    <Form className="custom-form" style={{ padding: 20 }}>
                                        <Label style={{ width: '100%', fontSize: '1.1rem', textTransform: 'none', fontFamily: 'revert', textAlign: 'center', color: 'black', marginBottom: 20 }} for="exampleEmail">Change Password</Label>
                                        <FormGroup style={{ display: 'flex' }}>
                                            <Label style={{ width: '50%', fontSize: '0.6rem', textTransform: 'none', fontFamily: 'revert' }} for="exampleEmail">Old Password</Label>
                                            <Input className="form-control" type="password" name="password" id="examplePassword" onChange={(e) => this.setState({ oldPassword: e.target.value })} value={this.state.oldPassword} />
                                        </FormGroup>
                                        <FormGroup style={{ display: 'flex' }}>
                                            <Label style={{ width: '50%', fontSize: '0.6rem', textTransform: 'none', fontFamily: 'revert' }} for="examplePassword" >New Password</Label>
                                            <Input className="form-control" type="password" name="password" id="examplePassword" onChange={(e) => this.setState({ newPassword: e.target.value })} value={this.state.newPassword} />
                                        </FormGroup>
                                        <FormGroup style={{ display: 'flex' }}>
                                            <Label style={{ width: '50%', fontSize: '0.6rem', textTransform: 'none', fontFamily: 'revert' }} for="examplePassword">Confirm New Password</Label>
                                            <Input className="form-control" type="password" name="password" id="examplePassword" onChange={(e) => this.setState({ confirmNewPassword: e.target.value })} value={this.state.confirmNewPassword} />
                                        </FormGroup>
                                        <FormGroup style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button style={{ background: '#3874BA', marginRight: 20 }} onClick={this.updatePassword} type="button">Update</Button>
                                            <Button style={{ background: '#727B83', color: 'white' }} type="button" onClick={() => this.setState({ resetPasswordModal: false })}>Cancel</Button>
                                        </FormGroup>
                                    </Form>
                                </Modal>
                            </div>
                        }
                        {this.state.showLogoutModal && (
                            <><div className="text-center">
                                <Modal isOpen={this.state.resetPasswordModal}>
                                    <Form className="custom-form" style={{ padding: 20 }}>
                                        <FormGroup style={{ display: 'flex' }}>
                                            <Label style={{ width: '50%', fontSize: '0.6rem', textTransform: 'none', fontFamily: 'revert' }} for="exampleEmail">Old Password</Label>
                                            <Input className="form-control" type="password" name="password" id="examplePassword" onChange={(e) => this.setState({ oldPassword: e.target.value })} value={this.state.oldPassword} />
                                        </FormGroup>
                                        <FormGroup style={{ display: 'flex' }}>
                                            <Label style={{ width: '50%', fontSize: '0.6rem', textTransform: 'none', fontFamily: 'revert' }} for="examplePassword">New Password</Label>
                                            <Input className="form-control" type="password" name="password" id="examplePassword" onChange={(e) => this.setState({ newPassword: e.target.value })} value={this.state.newPassword} />
                                        </FormGroup>
                                        <FormGroup style={{ display: 'flex' }}>
                                            <Label style={{ width: '50%', fontSize: '0.6rem', textTransform: 'none', fontFamily: 'revert' }} for="examplePassword">Confirm New Password</Label>
                                            <Input className="form-control" type="password" name="password" id="examplePassword" onChange={(e) => this.setState({ confirmNewPassword: e.target.value })} value={this.state.confirmNewPassword} />
                                        </FormGroup>
                                        <FormGroup style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 10 }}>
                                            <Button style={{ marginRight: 20 }} onClick={this.updatePassword} type="button">Update</Button>
                                            <Button style={{ background: 'red', color: 'white' }} type="button" onClick={() => this.setState({ resetPasswordModal: false })}>Cancel</Button>
                                        </FormGroup>
                                    </Form>
                                </Modal>
                            </div>


                                <div className="text-center">
                                    <Modal isOpen={this.state.showLogoutModal}>
                                        <ModalHeader>LOGOUT</ModalHeader>
                                        <ModalBody>
                                            Are you sure you want to logout?
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button style={{ background: '#3874BA' }} onClick={() => this.logout()}>
                                                Yes
                                            </Button>{" "}
                                            <Button style={{ background: '#727B83' }} onClick={() => this.setState({ showLogoutModal: false })}>
                                                No
                                            </Button>
                                        </ModalFooter>
                                    </Modal>
                                </div></>
                        )}
                    </div>
                </div>
            </Navbar>

        );
    }
}

export default NavigationBar;