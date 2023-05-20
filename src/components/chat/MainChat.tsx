
import React, { KeyboardEvent } from "react";
import Dropzone from 'react-dropzone';
import { Button, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Form, FormGroup, Input, Label, Modal, ModalBody, ModalHeader } from "reactstrap";
import DndComponent from './DndComponent'
import Spinner from "./../../components/spinner/spinner";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { wglcsApiService } from '../../services/WglcsApiService'
import { AvailableUserForTransfer, ChatModel, WebsiteBlockKeywords, LoginResponse, UnReadCountModel, OperatorType, QAChat, OperatorChat, IDestroyRoom } from '../../models/index';
import { chatService } from '../../services/chatService';
import OperatorList from "./OperatorList";
import ConversationListComponent from "./ConversationListComponent";
import { utils } from "../../utils";
import EventEmitter from '../../services/eventemitter';
import { Events } from '../../models/events';
import { Menu } from "react-feather";
import * as _ from 'lodash';
import CurseWords from './files/CurseWords.js';
import { getUrl, checkMaskingTypeEmail, checkMaskingTypePhone } from '../../constants/urlChecker ';
var extensionArray = ['.xls', '.xlsx', '.xlsm', '.csv', '.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx', '.txt', '.ppt', '.pptx', '.css', '.psd', '.gif']
interface MainChatProps {
    selectedChat: ChatModel,
    qaChat: QAChat | undefined,
    lengthChat: number;
    operatorType: OperatorType,
    optChat: OperatorChat[],
    showSnackbar: any
}

interface MainChatState {
    selectedChat: ChatModel;
    currentText: string;
    looding: boolean;
    isDndModelOpen: boolean;
    isblockModelOpen: boolean;
    availableOperators: AvailableUserForTransfer[];
    isOperatorMenuOpen: boolean;
    isOperatorListVisible: boolean;
    UserData: LoginResponse;
    isScrollToBottomVisible: boolean;
    messageScrollTop: number;
    lock: boolean,
    radioButton1: boolean,
    radioButton2: boolean,
    containerView: boolean,
    updateName: boolean,
    name: string,
    messageHasCurseWorkOrBlockkeyword: boolean,
    websiteBlockKeywords: WebsiteBlockKeywords[],
    toastMessage: string
}

class MainChat extends React.Component<MainChatProps, MainChatState> {

    messagesHtmlRef: HTMLDivElement | null = null;

    constructor(props) {
        super(props);
        this.state = {
            currentText: '',
            looding: false,
            isDndModelOpen: false,
            isblockModelOpen: false,

            isOperatorMenuOpen: false,
            availableOperators: [],
            selectedChat: this.props.selectedChat,
            isOperatorListVisible: false,
            UserData: ((JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse),
            isScrollToBottomVisible: true,
            messageScrollTop: 0,
            lock: true,
            radioButton1: true,
            radioButton2: false,
            containerView: false,
            updateName: false,
            name: '',
            messageHasCurseWorkOrBlockkeyword: false,
            websiteBlockKeywords: [],
            toastMessage: ''
        }

        EventEmitter.on(Events.OnMessageTextInput, this.OnMessageTextInput);
        EventEmitter.on(Events.ScrollMainChatToBottom, this.scrollToBottom);
        EventEmitter.on(Events.ScheduleUnReadCount, this.onMessagesScroll);
    }

    componentDidUpdate(prevProps: MainChatProps, prevState: MainChatState) {
        if ((prevProps.selectedChat != this.props.selectedChat)) {
            this.setState({
                selectedChat: this.props.selectedChat,

            });

            this.onMessagesScroll();
        }
    }

    componentDidMount = async () => {
        var data: WebsiteBlockKeywords[] = (await wglcsApiService.websiteblockkeywords_selectbyuser(this.state.UserData.userLoginData.userId)).data?.data ?? [];
        console.log(data, '       blocked keywords data')
        this.setState({ websiteBlockKeywords: data })
    }

    OnMessageTextInput = (text: string) => {

        if (text == '') {
            return;
        }

        this.setState({
            currentText: text
        });
    }

    updateVisitorInfomation = async (chatId: string) => {
        var result3 = await wglcsApiService.getvisitorinformationbychatid(chatId);

        var selectedChat = this.state.selectedChat;
        selectedChat.visitorInformation = result3.data!.data[0];
        this.setState({
            selectedChat: selectedChat
        });
    }

    transferChatToOperator = async (operatorId: number) => {

        var selectedTargetOperator = this.state.availableOperators.filter(f => f.userId == operatorId)[0];
        await chatService.transferChatOperator(this.state.selectedChat.info, selectedTargetOperator);

        await wglcsApiService.transferChatToOtherOperator(operatorId, parseInt(this.state.selectedChat.info.chatId));
        EventEmitter.emit(Events.OnDestroyRoom, { chatId: this.state.selectedChat.info.chatId, showMailForm: false } as IDestroyRoom);
        this.setState({ isOperatorListVisible: false })
    }

    setDnD = async () => {
        var user = this.state.selectedChat.visitorInfo?.Info ?? this.state.selectedChat.info;
        this.EmailForm();
        let status = {
            "visitorId": user?.visitorId ?? user.VisitorID,
            "chatId": user?.chatId ?? user.ChatId,
            "statusType": "[DND]"
        }
        await wglcsApiService.updatevisitorchatstatus(status);
        await chatService.dndChat(this.state.selectedChat.info.chatType, this.state.selectedChat.roomId, this.state.selectedChat.info.websiteId, this.state.selectedChat.info.visitorId);
        EventEmitter.emit(Events.OnDestroyRoom, { chatId: this.state.selectedChat.info.chatId, showMailForm: false } as IDestroyRoom);
        this.setState({ isDndModelOpen: false });
    }

    EmailForm = async () => {
        var currentChat = this.state.selectedChat;
        let visiterId = currentChat?.info?.visitorId;
        let chatId = currentChat?.info?.chatId;
        let webId = currentChat.info.websiteId;
        let uId = this.state.UserData.userLoginData.userId;
        var empCompId = this.state.UserData.userLoginData.empCompId;

        utils.EmailForm(parseInt(visiterId?.toString() ?? ""), chatId, webId, uId, currentChat?.localConversation[0]?.timeStamp, empCompId);
    }

    transferChat = async () => {
        var result = await wglcsApiService.getAvailableOperators(this.state.selectedChat.info.websiteId, this.state.UserData.userLoginData.userId);
        // TODO. Fix this. 
        if (this.state.selectedChat.visitorInformation == null) {
            this.updateVisitorInfomation(this.state.selectedChat.info.chatId);
        }
        this.setState({ availableOperators: result.data!.data, isOperatorListVisible: true });
    }

    blockChat = async () => {

        var user = this.state.selectedChat.visitorInfo?.Info ?? this.state.selectedChat.info;

        await wglcsApiService.updatevisitorchatstatus({
            "visitorId": user.visitorId,
            "chatId": user.chatId,
            "statusType": "Ignore"
        });
        this.EmailForm();
        await chatService.blockChat(this.state.selectedChat.info.chatType, this.state.selectedChat.roomId, this.state.selectedChat.info.websiteId, this.state.selectedChat.info.visitorId, this.state.selectedChat.info.chatId);
        EventEmitter.emit(Events.OnDestroyRoom, { chatId: this.state.selectedChat.info.chatId, showMailForm: false } as IDestroyRoom);
        this.setState({ isblockModelOpen: false });
    }
    showHideContainers() {

        EventEmitter.emit(Events.ToggleShowHideComponent, !this.state.containerView)
        this.setState({ containerView: !this.state.containerView });

    }
    visitorActions = () => {
        return (
            <div className="tab-header-full-right text-right tab-pad">
                <UncontrolledDropdown nav inNavbar className="pr-1" style={{ listStyleType: 'none' }}>
                    <DropdownToggle nav>
                        <Menu size={20} color="#333" />
                    </DropdownToggle>
                    <span onClick={() => this.showHideContainers()} className="info-icon d-lg-none"><i className="fa fa-info"></i></span>
                    <DropdownMenu right>
                        {this.props.operatorType == OperatorType.Operator &&
                            <DropdownItem className="" data-toggle="modal" onClick={() => this.setState({ isDndModelOpen: true })}>
                                <DndComponent
                                    title={'DND'}
                                    visitorName=""
                                    isOpen={this.state.isDndModelOpen}
                                    OnYes={() => this.setDnD()}
                                    OnNo={() => this.setState({ isDndModelOpen: false })}
                                />
                            </DropdownItem>}
                        <DropdownItem divider />
                        {this.props.operatorType == OperatorType.Operator &&
                            <DropdownItem onClick={() => this.setState({ updateName: true })}>
                                <span className="font-small-dd">
                                    Change Name
                                </span>
                            </DropdownItem>}

                        <DropdownItem divider />
                        <DropdownItem onClick={() => this.transferChat()}>
                            <span className="font-small-dd">
                                Transfer
                            </span>
                        </DropdownItem>
                        <DropdownItem divider />
                        <DropdownItem onClick={() => this.setState({ isblockModelOpen: true })}>
                            <DndComponent
                                title={'Block'}
                                visitorName=""
                                isOpen={this.state.isblockModelOpen}
                                OnYes={() => this.blockChat()}
                                OnNo={() => this.setState({ isblockModelOpen: false })} />
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>
            </div>
        );
    }

    SendMessage = () => {
        if (this.props.selectedChat.checkRoleQC && !this.state.radioButton2) {

            chatService.sendMessage(
                this.state.selectedChat,
                this.state.currentText,
                false,
                this.props.qaChat

            )
            this.setState({ currentText: '' });

        }
        else if (!this.state.selectedChat.checkRoleQC && this.state.radioButton2) {
            this.lockChat(this.state.currentText)


        }
        else if (this.state.selectedChat.checkRoleQC && this.state.radioButton2) {
            chatService.sendMessage(
                this.state.selectedChat,
                this.state.currentText,
                true,
                this.props.qaChat
            )
            this.setState({ currentText: '' });

        }
        else {
            chatService.sendMessage(
                this.state.selectedChat,
                this.state.currentText,
                false,
                this.props.qaChat
            )
            this.setState({ currentText: '' });
        }
    }

    BeforeMessageSend = (event: KeyboardEvent<HTMLTextAreaElement> | null) => {

        var msg = this.state.currentText.trim();
        if (event != null && event.key !== 'Enter') {
            return;
        }

        if (msg.length === 0) {
            return;
        }

        var hasCurseWord = _.some(CurseWords, item => this.state.currentText.toLowerCase() == item.toLowerCase());
        var hasblockKeyword = _.some(this.state.websiteBlockKeywords, data => this.state.currentText.toLowerCase().includes(data.keyword.toLowerCase()));
        if (hasCurseWord) {
            this.props.showSnackbar(hasCurseWord, 'You cannot send this message as your message contains curse words');
            return;
        } else if (hasblockKeyword) {
            this.props.showSnackbar(hasblockKeyword, 'You cannot send this message as your message contains blocked keyword');
            return;
        }

        var isThirdPartyUrl = utils.isThirdPartyUrl(this.state.currentText);

        if (isThirdPartyUrl) {
            confirmAlert({
                message: 'The link you are sending is from a different website, are you sure you want to push this link? ',
                buttons: [
                    {
                        label: 'Yes',
                        onClick: () => {
                            this.SendMessage();
                        }
                    },
                    {
                        label: 'No',
                        onClick: () => { }
                    }
                ]
            });
        } else {
            event?.preventDefault();
            this.SendMessage();
        }
    }

    scrollToBottom = () => {
        if (this.messagesHtmlRef == null) {
            return;
        }

        this.messagesHtmlRef.scrollTop = this.messagesHtmlRef.scrollHeight;
    }

    isScrollGoingDown = (scrollTop: number) => {
        return scrollTop >= this.state.messageScrollTop;
    }

    onMessagesScroll = () => {
        var scrollEnded = this.isScrollAtBottom();

        var elem = this.messagesHtmlRef!;

        if (elem == null) {
            return;
        }

        var messagesElements = Array.from(elem.children) as HTMLElement[];

        var currentScrollTop = elem.scrollTop + elem.offsetHeight;

        if (messagesElements.length > 0) {
            var lastMessage = messagesElements[messagesElements.length - 1];
            var lastMessageScrollTop = lastMessage.offsetTop + lastMessage.scrollHeight - elem.scrollHeight;
            currentScrollTop += lastMessageScrollTop;
        }


        var messages = messagesElements
            .filter(item => item.className == "received_withd_msg" || "sent_msg_OPColor")
            .map(item => ({ scrollTop: item.offsetTop + item.scrollHeight, chatMessageId: item.dataset["chatmessageid"]?.toString() ?? '' }));

        var [unReadMessages, readMessages] = _.partition(messages, f => f.scrollTop > currentScrollTop);

        EventEmitter.emit(Events.UpdateUnReadCount, {
            chatId: this.state.selectedChat.info.chatId,
            unReadMessageIds: unReadMessages.map(a => a.chatMessageId), readMessageIds:
                readMessages.map(a => a.chatMessageId)
        } as UnReadCountModel);

        this.setState({ isScrollToBottomVisible: !scrollEnded, messageScrollTop: elem.scrollTop });
    }

    isScrollAtBottom = () => {
        if (this.messagesHtmlRef == null) {
            return false;
        }

        var elem = this.messagesHtmlRef!;

        var maximumScrollTop = elem.scrollHeight - elem.offsetHeight;
        var scrollEnded = elem.scrollTop == maximumScrollTop;

        return scrollEnded;
    }

    getVisitorName(): String {

        var visitorName = this.state?.selectedChat?.visitorInformation?.visitorName.toString() ?? '';

        if (visitorName.includes('Visitor')) {
            visitorName = '';
        }

        if (visitorName == '') {
            visitorName = this.state.selectedChat?.info?.visitorName ?? '';
        }

        if (visitorName.includes('Visitor')) {
            visitorName = '';
        }

        return visitorName == '' ? 'Name' : visitorName;
    }

    lockChat = async (value: string) => {
        const response = await wglcsApiService.getUserInfo(this.props.qaChat?.userId!);
        const userName = response.data?.data.userName;

        if (!this.state.selectedChat.checkRoleQC) {

            await chatService.sendMessage(
                this.state.selectedChat,
                `Chat taken over by: ${this.state.UserData.userLoginData.username} from ${userName}`,
                true,
                this.props.qaChat
            )
            await chatService.sendMessage(
                this.state.selectedChat,
                '[LockChat]',
                true,
                this.props.qaChat
            )
            if (!_.isEmpty(value)) {

                await chatService.sendMessage(
                    this.state.selectedChat,
                    this.state.currentText,
                    true,
                    this.props.qaChat
                )
                this.setState({ currentText: '' });
            }
            else {
                this.setState({ currentText: '' });
            }

        }



    }


    unLockChat = () => {
        if (!_.isEmpty(this.state.currentText)) {

            chatService.sendMessage(
                this.state.selectedChat,
                '[UnLockChat]',
                false,
                this.props.qaChat
            )
            chatService.sendMessage(
                this.state.selectedChat,
                this.state.currentText,
                false,
                this.props.qaChat
            )
            this.setState({ currentText: '' });
        }
        else {
            chatService.sendMessage(
                this.state.selectedChat,
                '[UnLockChat]',
                false,
                this.props.qaChat
            )
            this.setState({ currentText: '' });

        }
    }
    checkOp = () => this.props.selectedChat.operatorType == OperatorType.Operator && this.props.selectedChat.blockOP;
    updateUserName = async () => {
        var chatInfo = this.state.selectedChat.info;

        chatService.updateNickName(chatInfo, this.state.name);

        await wglcsApiService.updateVisitorInfo({
            visitorId: chatInfo.visitorId,
            visitorName: this.state.name
        });

        this.updateVisitorInfomation(chatInfo.chatId);
        this.setState({ updateName: false })

    }
    dropFile=( file:any)=>{
        
this.commonFileMethod(file)

    }
    handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
       
        this.commonFileMethod(e.target.files);

    }
    private commonFileMethod(files: any) {
        var i: Number = 0;
        var extensionCheck: Boolean = false;
        var uploadFiles =files;
        var array = [] as any;
        if (uploadFiles?.length < 7) {
            Array.from(uploadFiles!).forEach((item:any, index) => {
                var extension = item.name.substr(item.name.lastIndexOf('.'));
                for (var j = 0; j < extensionArray.length; j++) {
                    if (extensionArray[j] == extension) {
                        extensionCheck = true;
                        break;
                    }
                    else {
                        extensionCheck = false;
                    }
                }


                if (!extensionCheck) {
                    alert(`${extension} file can't be uploaded `);


                }

                else if (item.size / 1024 / 1024 > 6) {
                    alert(`${item.name} more then 6mb can't be uploaded `);
                }
                else {
                    array.push(item);
                }
            });
            if (array.length > 0) {

                confirmAlert({
                    message: 'Are You sure you want to share the attached file? ',
                    buttons: [
                        {
                            label: 'Yes',
                            onClick: () => {
                                this.recursiveUploadFile(array, i);

                            }
                        },
                        {
                            label: 'No',
                            onClick: () => { }
                        }
                    ]
                });
            }
        }
        else {
            alert('More than 6 files cannot be uploaded!');
        }
    }

    async recursiveUploadFile(files, i) {
        var formData: FormData = new FormData();
        formData.append('file', files[i]);
        const res = await wglcsApiService.shareImagesToUpload(formData);
        i = i + 1;
        chatService.sendMessage(
            this.state.selectedChat,
            res.data.toString(),
            false,
            this.props.qaChat
        )
        if (res.status == 200) {
            if (files.length > i) {
                return this.recursiveUploadFile(files, i)
            }
        }
        return;
    }
    getEmail = (selectedEmail: String) => {
        if (this.state.UserData.userLoginData.empCompId == '01' && selectedEmail!) {

            var checkMasking = this.props.optChat?.find(item => item.id == Number(this.state.selectedChat?.info?.websiteId));
            if (checkMasking?.maskingTypeID != '1') {

                var maskingEmail = checkMaskingTypeEmail(selectedEmail);
                return maskingEmail;

            }
            else {
                return selectedEmail;
            }

        }
    }
    getPhone = (selectedPhone: String) => {
        if (this.state.UserData.userLoginData.empCompId == '01' && selectedPhone!) {

            var checkMasking = this.props.optChat?.find(item => item.id == Number(this.state.selectedChat?.info?.websiteId));
            if (checkMasking?.maskingTypeID != '1') {

                var maskingPhone = checkMaskingTypePhone(selectedPhone);
                return maskingPhone;

            }
            else {
                return selectedPhone;
            }

        }
    }
    render() {

        const { looding } = this.state
        if (looding) {
            return (<Spinner />)
        } else {
            return (
                <>

                    {this.state.selectedChat.operatorType == OperatorType.QualityControl &&
                        <Form className="radio-btns">
                            <FormGroup check inline>
                                <Label check>
                                    <Input checked={this.state.radioButton2} value='take' onChange={() => { this.setState({ radioButton1: false, radioButton2: true }) }} type="radio" /><span className="text-capitalize">Take Over</span>
                                </Label>
                            </FormGroup>
                            <FormGroup check inline>

                                <Label check>
                                    <Input checked={this.state.radioButton1} value='internal' onChange={() => { this.setState({ radioButton1: true, radioButton2: false }) }} type="radio" /><span className="text-capitalize">Internal Message</span>
                                </Label>
                            </FormGroup>
                        </Form>
                    }
                    <div className="tab-content" id="nav-tabContent" style={{ padding: '0px !important' }}>
                        <div key={this.state.selectedChat?.info?.chatId} role="tabpanel" className={"pl-0 pr-0 tab-pane fade show active"}>
                            <div className="tab-header col-lg-12 d-flex pl-0 pr-0 flex-row">
                                {this.props.operatorType == OperatorType.QualityControl && <span onClick={() => this.showHideContainers()} className="info-icon hybrid d-sm-none"><i className="fa fa-info"></i></span>}
                                <div className="tab-header-left col-lg-5 col-md-3 col-sm-12 col-xs-12 tab-pad">
                                    <span className="visitor-id">{(this.state.selectedChat.info.chatType == 'facebook' || this.state.selectedChat.info.chatType == 'TextUs') ? this.getVisitorName() : this.getVisitorName() == 'Name' ? `Name: ${this.state.selectedChat?.visitorData?.visitorid ?? '[Visitor ID Pending]'}` : this.getVisitorName()}</span>
                                    {this.props.operatorType == OperatorType.Operator && <span className="vivitor-contact"><span className="cross-icon"><i className={this.state.selectedChat?.visitorInformation?.visitorPhone && "fa fa-check-circle-o"}></i></span>{this.state.selectedChat?.visitorInformation?.visitorPhone ?? ''}</span>}

                                </div>

                                {this.props.operatorType == OperatorType.Operator &&
                                    <div className="tab-header-right col-lg-7 col-md-9 col-sm-12 col-xs-12 text-right">
                                        <span className="chat-url"><a href="#">{getUrl(this.state.selectedChat)}</a></span>
                                        <span className={this.state.selectedChat?.visitorInformation?.visitorEmail && "visitor-email"}><span className="cross-icon"><i className={this.state.selectedChat?.visitorInformation?.visitorEmail && "fa fa-check-circle-o"}></i></span>{this.state.selectedChat?.visitorInformation?.visitorEmail ?? ''}</span>
                                        {this.props.operatorType == OperatorType.Operator && this.visitorActions()}

                                    </div>}
                                {this.props.operatorType == OperatorType.QualityControl && <span onClick={() => this.showHideContainers()} className="info-icon hybrid d-sm-none"><i className="fa fa-info"></i></span>}

                            </div>
                            <div className="chat-window" >
                                <div className="mesgs" onScroll={() => { this.onMessagesScroll() }} ref={(ref) => this.messagesHtmlRef = ref} style={{ background: this.props.operatorType == OperatorType.Operator ? this.state.selectedChat.color : 'white', height: "335px" }} >
                                    {this.state.isScrollToBottomVisible &&
                                        <div id="chat_bottom">
                                            <div className="arrow" id="scrollToBottom" onClick={() => { this.scrollToBottom(); }}>
                                                <i className="fa-sm fal fa-chevron-circle-down"></i>
                                            </div>
                                        </div>}
                                    <ConversationListComponent conversation={this.state.selectedChat ?? []} operatorType={this.state.selectedChat.operatorType} />
                                </div>
                            </div>

                            {(this.props.selectedChat.operatorType == OperatorType.QualityControl && this.state.radioButton2) ?
                                this.props.selectedChat.checkRoleQC ?
                                    <i onClick={() => { this.unLockChat() }} className="pi pi-lock p-mr-2 float-left lock" ></i>
                                    : <i onClick={() => { this.lockChat(this.state.currentText) }} className="pi pi-lock-open p-mr-2 float-left lock "></i> : null}
                            {this.props.operatorType == OperatorType.Operator && this.state.selectedChat?.previewMessage?.length > 1 ? <div className="prev">
                                <p>{this.state.selectedChat?.previewMessage.substr(0, 110)}</p></div> : null}
                            <span style={{ borderTop: '1px solid red' }} />
                            <div className="type_msg">
                                <div className="input_msg_write">
                                <Dropzone style={{borderStyle:'none',width:'100%'}} disableClick  onDrop={(file)=>this.dropFile(file)}>
                                    <textarea
                                        disabled={this.state.selectedChat.blockOP}
                                        onKeyPress={(event) => this.BeforeMessageSend(event)}
                                        onChange={(i) => { this.setState({ currentText: i.target.value }) }}
                                        value={this.state.currentText}
                                        className="write_msg"

                                        placeholder="Type a message">

                                     
                                        </textarea>
                                        </Dropzone>

                                </div>
                                <div className="chat-icons">
                                    {this.props.operatorType == OperatorType.Operator && <button disabled={this.checkOp()} className="msg_send_btn paper-clip"> <label htmlFor="file-input"><i className="fal fa-paperclip" aria-hidden="true"></i></label><input id="file-input" className="fileInput" type='file' name='filename' accept=".xls,.xlsx,.xlsm,.csv,.pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.ppt,.pptx,.css,.psd,.gif" multiple onChange={this.handleImageChange} /></button>}
                                    <button disabled={this.checkOp()} onClick={(e) => { this.BeforeMessageSend(null) }} className={this.checkOp() ? "msg_send_btn_disable msg_icon_reply" : "msg_send_btn msg_icon_reply"} type="button"><i className="fal fa-paper-plane" aria-hidden="true"></i></button>
                                    {/* {this.props.operatorType == OperatorType.Operator && <button disabled={this.checkOp()} className={this.checkOp() ? "msg_send_btn_disable msg_icon_repeat" : "msg_send_btn msg_icon_repeat"} type="button"><i className="fal fa-redo-alt" aria-hidden="true"></i></button>} */}
                                </div>



                            </div>
                        </div>
                    </div>
                    <div>
                        <OperatorList
                            modalState={this.state.isOperatorListVisible}
                            toggle={() => this.setState({ isOperatorListVisible: !this.state.isOperatorListVisible })}
                            availableOperators={this.state.availableOperators.filter(f => f.userId != this.state.UserData.userLoginData.userId)}
                            OnOperatorSelected={this.transferChatToOperator}
                        />
                    </div>
                    <Modal isOpen={this.state.updateName} className="change-name-modal">
                        <ModalHeader>Change Name</ModalHeader>
                        <ModalBody>
                            <Input onChange={(e) => this.setState({ name: e.target.value })} />
                            <Button onClick={this.updateUserName} style={{ background: '#3874BA', margin: '15px 5px' }}>
                                Save
                            </Button>
                            <Button onClick={() => this.setState({ updateName: false })} style={{ background: '#727B83', margin: '15px 5px' }}>
                                Cancel
                            </Button>
                        </ModalBody>


                    </Modal>
                </>
            )
        }
    }
}

export default MainChat;