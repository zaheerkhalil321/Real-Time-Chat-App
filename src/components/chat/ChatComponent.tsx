import React from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import {
  ContextMenuTrigger,
  ContextMenu,
  ContextMenuItem,
} from "rctx-contextmenu";
import moment, { Moment } from "moment";
import { wglcsApiService } from "../../services/WglcsApiService";
import VisitorInformationComponent from "./VisitorInformations";
import LiveInfoCard from "./LiveInfoCard";
import OperatorMessagesComponent from "./OperatorMessages";
import SystemInfo from "./SystemInfo";
import ClickPath from "./ClickPath";
import MainChat from "./MainChat";
import { chatService } from "../../services/chatService";
import Spinner from "../spinner/spinner";
import "./../../assets/scss/contextMenu.scss";
import {
  MessageModel,
  LoginResponse,
  ChatModel,
  VisitorData,
  VisitorInitData,
  VisitorConversation,
  UnReadCountModel,
  ChatMessageModel,
  OperatorType,
  OperatorChat,
  QAChat,
  OperatorBreakModel,
  IDestroyRoom,
  ApiResult,
} from "../../models/index";
import EventEmitter from "../../services/eventemitter";
import { Events } from "../../models/events";
import OPChat from "./audio/OPChat.wav";
import OPMsg from "./audio/MsgBell.wav";
import * as _ from "lodash";
import SnackBar from "./../../views/alert/SnackBar";
import { loginService } from "../../services/loginService";
import NoChat from "../../assets/img/no-active-chat.jpg";

import { xmppChatService } from "../../services/XmppChatService";
import {
  emailRegex,
  phoneRegex,
  checkMaskingTypeEmail,
  checkMaskingTypePhone,
  getUrl,
} from "../../constants/urlChecker ";
import { utils } from "../../utils/index";
import { Toast } from "primereact/toast";
import addNotification from "react-push-notification";
import logo from "../../assets/img/logos/WG.png";
import { AxiosResponse } from "axios";
import { signalRChatService } from "../../services/SignalRChatService";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

interface ChatProps {
  hybridChat: boolean;
}

interface ChatState {
  isLoading: boolean;
  currentBreakpoint: any;
  compactType: string | null;
  mounted: boolean;
  draggable: boolean;
  layouts: any;
  chats: Map<String, ChatModel>;
  lastMessageTimeMap: Map<String, Moment>;
  userData: LoginResponse;
  currentChatId: string | null;
  position: any;
  opTreeChats: OperatorChat[];
  qaChats: QAChat[];
  showContainer: boolean;
  isSnackbarVisible: boolean;
  showSnackBarMessage: string;
  isOperatorOnBreak: boolean;
  operatorBreakData: OperatorBreakModel | null;
}

class ChatComponent extends React.Component<ChatProps, ChatState> {
  toast: Toast | null = null;
  status: any;
  titleMissingCaption: string = "Title Missing in Api";
  activeWindowInterval!: NodeJS.Timeout;
  hybridInterval!: NodeJS.Timeout;
  onNewChatAudio = new Audio(OPChat);
  onNewMessageAudio = new Audio(OPMsg);

  constructor(props) {
    super(props);
    var userData = JSON.parse(
      localStorage.getItem("USER_DATA")!
    ) as LoginResponse;

    if (userData == null) {
      loginService.logout();
    }

    this.state = {
      currentBreakpoint: "lg",
      compactType: "vertical",
      mounted: true,
      isLoading: false,
      draggable: true,
      layouts: {
        lg: [
          { i: "f", x: 0, y: 0, w: 3, h: 6, static: true },
          { i: "a", x: 3, y: 0, w: 6, h: 3, static: true },
          { i: "b", x: 9, y: 0, w: 3, h: 2.1 },
          { i: "c", x: 9, y: 3, w: 3, h: 0.6 },
          { i: "d", x: 9, y: 4, w: 3, h: 2 },
          { i: "e", x: 3, y: 1, w: 6, h: 3 },
        ],
      },
      chats: new Map<String, ChatModel>(),
      lastMessageTimeMap: new Map<String, Moment>(),
      userData: userData,
      currentChatId: this.getPersistedCurrentChat(),
      position: 0,
      opTreeChats: [],
      qaChats: [],
      showContainer: true,
      showSnackBarMessage: "",
      isSnackbarVisible: false,
      isOperatorOnBreak: false,
      operatorBreakData: null,
    };

    this.onLoad = this.onLoad.bind(this);
    this.onCompactTypeChange = this.onCompactTypeChange.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.onVisitorData = this.onVisitorData.bind(this);
    this.onInitData = this.onInitData.bind(this);
    this.getHybridChats = this.getHybridChats.bind(this);
    this.checkOpTreeChats = this.checkOpTreeChats.bind(this);
    this.showHideContainer = this.showHideContainer.bind(this);

    EventEmitter.on(Events.onNewChatReceived, this.onNewChatReceived);
    EventEmitter.on(Events.onChatMessageReceived, this.onChatMessageReceived);
    EventEmitter.on(Events.onInitData, this.onInitData);
    EventEmitter.on(Events.onVisitorDataUpdate, this.onVisitorData);
    EventEmitter.on(Events.OnDestroyRoom, this.OnDestroyRoom);
    EventEmitter.on(Events.UpdateUnReadCount, this.UpdateUnReadCount);
    EventEmitter.on(Events.ToggleShowHideComponent, this.showHideContainer);
    EventEmitter.on(Events.onPreviewMessage, this.onPreviewMessage);
    EventEmitter.on(Events.ReAttachExistingRooms, this.reAttachExistingRooms);
    EventEmitter.on(Events.startOperatorBreak, this.startOperatorBreak);
    EventEmitter.on(Events.endOperatorBreak, this.endOperatorBreak);
  }

  handleWindowSizeChange = () => {
    if (window.innerWidth <= 768) {
      this.setState({ showContainer: false, draggable: false });
    } else {
      this.setState({ showContainer: true, draggable: true });
    }
  };

  componentDidMount = async () => {
    this.onLoad();

    if (window.innerWidth <= 768) {
      this.setState({ showContainer: false, draggable: false });
    } else window.addEventListener("resize", this.handleWindowSizeChange);

    if (this.props.hybridChat) {
      this.hybridInterval = setInterval(this.getHybridChats, 15000);
      await this.AssignUsers2WebsiteQc();
    } else {
      setInterval(this.checkOpTreeChats, 5000);
      this.activeWindowInterval = setInterval(
        () => this.isActiveOperatorWindow(),
        15000
      );
    }
  };

  async componentWillUnmount() {
    xmppChatService.disconnect();

    clearInterval(this.activeWindowInterval);
    clearInterval(this.hybridInterval);

    if (this.props.hybridChat) {
      await this.unAssignUsersFromWebsitesQc();
    }

    await this.markAvailability(false);
    window.removeEventListener("resize", this.handleWindowSizeChange);
  }

  isActiveOperatorWindow = () => {
    var userData = JSON.parse(
      localStorage.getItem("USER_DATA")!
    ) as LoginResponse;
    var logId = userData?.userLoginData?.userLog;

    if (logId == null) {
      return;
    }

    if (this.state.isOperatorOnBreak) {
      return;
    }

    wglcsApiService.updateoperatortimestamp({
      logId: logId,
      isActiveOperatorWindow: true,
    });

    wglcsApiService.getIsLogIDAlive(logId);
  };

  onPreviewMessage = (previewData: any) => {
    var chats = this.state.chats;
    var chatModel = chats.get(previewData.chatId);

    if (chatModel != undefined) {
      chatModel.previewMessage = previewData.message;
      chats.set(previewData.chatId, chatModel);

      this.setState({ chats: chats });
    }
  };

  async getHybridChats() {
    var chats = await this.getExistingChatsForHybridChat();
    if (chats.length > 0) {
      await this.addExistingChats(chats);
    }
  }

  geFinalTime(timeStamp) {
    var startTime;
    if (timeStamp.includes("/")) {
      let signalRDateFormat = timeStamp.substr(0, 19);
      startTime = moment
        .utc(signalRDateFormat)
        .local()
        .format("YYYY-MM-DD HH:mm:ss");
      startTime = startTime.split(" ")[1];
    } else {
      startTime = moment.utc(timeStamp).local().format("YYYY-MM-DD HH:mm:ss");
      startTime = startTime.split(" ")[1];
      // let startTime =timeStamp.includes('T')?timeStamp.split('T')[1]:timeStamp.split(' ')[1];
    }
    return startTime;
  }

  timeStamp() {
    let endTime = moment.utc().local().format("YYYY-MM-DD HH:mm:ss");
    endTime = endTime.split(" ")[1];
    return endTime;
  }

  AssignUsers2WebsiteQc = () => {
    if (!signalRChatService.isConnected()) {
      console.info(
        "[AssignUsers2WebsiteQc] SignalR Not Connected Yet. Checking in 3 second."
      );
      setTimeout(this.AssignUsers2WebsiteQc, 3000);
      return;
    }

    signalRChatService.assignUsersToWebsiteQc(
      this.state.userData.userLoginData.userId,
      this.state.userData.userLoginData.languageId
    );
  };

  unAssignUsersFromWebsitesQc = () => {
    if (!signalRChatService.isConnected()) {
      console.info(
        "[unAssignUsersFromWebsitesQc] SignalR Not Connected Yet. Checking in 3 second."
      );
      setTimeout(this.unAssignUsersFromWebsitesQc, 3000);
      return;
    }

    signalRChatService.unAssignUsersFromWebsitesQc(
      this.state.userData.userLoginData.userId
    );
  };

  async checkOpTreeChats() {
    var allCHats = this.state.chats;

    Array.from(this.state.chats).map((chat) => {
      if (chat[1].time != "") {
        var sec = moment
          .utc(this.timeStamp(), "HH:mm:ss")
          .diff(
            moment.utc(this.geFinalTime(chat[1].time), "HH:mm:ss"),
            "seconds"
          );

        var chatModel = allCHats.get(chat[0]);
        if (chatModel != undefined) {
          if (sec > 60) {
            chatModel.color = "#ffe0e0";
            allCHats.set(chat[0], chatModel);
          } else if (sec < 60 && sec > 35) {
            chatModel.color = "#e1e1e1";
            allCHats.set(chat[0], chatModel);
          } else if (sec < 35) {
            chatModel.color = "white";
            allCHats.set(chat[0], chatModel);
          }
        }
      } else {
        var chatModel2 = allCHats.get(chat[0]);
        if (chatModel2 != undefined) {
          chatModel2.color = "white";
          allCHats.set(chat[0], chatModel2);
        }
      }
    });
    this.setState({ chats: allCHats });
  }

  OnDestroyRoom = async (obj: IDestroyRoom) => {
    console.log("Destorying Room with ChatId: " + obj.chatId);

    var chats = this.state.chats;
    var currentChatId = this.state.currentChatId;
    var chatExists = chats.has(obj.chatId);
    var chatModel = chats.get(obj.chatId) as ChatModel;

    if (!chatExists) {
      console.warn(
        `Chat ${obj.chatId} Does not exist locally. Maybe removed already ?`
      );
      return;
    }

    let isOperatorChat = chatModel.operatorType == OperatorType.Operator;

    if (obj.showMailForm && isOperatorChat) {
      this.EmailForm(obj.chatId);
    }

    chats.delete(obj.chatId);
    console.log("Room Destoryed with ChatId: " + obj.chatId);

    if (currentChatId == obj.chatId) {
      currentChatId = null;
    }

    if (Array.from(chats.keys()).length > 0) {
      currentChatId = Array.from(chats.keys())[0].toString();
    }

    this.setState({
      chats: chats,
      currentChatId: currentChatId,
    });

    await wglcsApiService.updateUserChatCount(
      this.state.userData.userLoginData.userId,
      this.state.chats.size
    );
  };

  showHideContainer = (check: boolean) => {
    this.setState({ showContainer: check });
  };

  currentWindow = (chatId: string) => {
    window.focus();
    this.persistStickyCurrentChat(chatId);
    EventEmitter.emit(Events.ScrollMainChatToBottom, null);
  };

  showNotification(messageRecieved: ChatMessageModel) {
    addNotification({
      title: messageRecieved.visitor_name,
      duration: 1200000,
      message: messageRecieved.message,
      native: true,
      icon: logo,
      theme: "light",
      onClick: (e: Event | Notification) =>
        this.currentWindow(messageRecieved.chatId),
    });
  }

  Notification(messageRecieved: ChatMessageModel) {
    if (!messageRecieved.isReceived) {
      return;
    }

    var lastChatMessageTime = this.state.lastMessageTimeMap.get(
      messageRecieved.chatId
    );
    var seconds =
      lastChatMessageTime == undefined
        ? 0
        : moment.duration(moment().diff(lastChatMessageTime)).asSeconds();

    // Only for the case when page is refreshed and all messages are retrieved in bulk.
    if (seconds < 0.2) {
      return;
    }

    if (messageRecieved.isReceived) {
      this.showNotification(messageRecieved);
    }

    if (messageRecieved.isSystemMessage) {
      this.showNotification(messageRecieved);
    }
  }

  onChatMessageReceived = (messageRecieved: ChatMessageModel) => {
    var chats = this.state.chats;
    var chatModel = chats.get(messageRecieved.chatId);

    var message = this.CheckMaskingTypeForMessage(
      messageRecieved.user_id,
      messageRecieved.managerId,
      messageRecieved.message,
      chatModel,
      messageRecieved.chatId
    );

    if (chatModel == null) {
      console.error(
        `No Chat Found for given ChatId: ${messageRecieved.chatId}`
      );
      return;
    }

    var conversation = chatModel.localConversation;

    var item = {
      IsSent: messageRecieved.isSent,
      messageText: message
        ? message.toString().replace("&apos;", "'")
        : "[NICKCHANGE]",
      chatId: messageRecieved.chatId,
      chatMessageId: `${messageRecieved.chatId}${messageRecieved.timeStamp}`,
      departmentName: null,
      userId: parseInt(messageRecieved.user_id),
      timeStamp:
        messageRecieved.timeStamp.length < 5
          ? moment.utc().format("YYYY-MM-DD HH:mm:ss")
          : messageRecieved.timeStamp,
      userName: messageRecieved.nickName,
      managerId: parseInt(messageRecieved.managerId),
      visiterId: chatModel.info.visitorId,
    } as VisitorConversation;

    conversation.push(item);

    chatModel.localConversation = conversation;
    chatModel.roomId = messageRecieved.roomId;
    var previousTime = chatModel.time;

    chatModel.time = item.IsSent
      ? ""
      : previousTime == ""
      ? item.userId == 0
        ? messageRecieved.timeStamp.length < 5
          ? moment.utc().format("YYYY-MM-DD HH:mm:ss")
          : messageRecieved.timeStamp
        : ""
      : previousTime;

    if (
      chatModel.operatorType == OperatorType.Operator &&
      message == "[LockChat]"
    ) {
      chatModel.blockOP = true;
    } else if (
      chatModel.operatorType == OperatorType.Operator &&
      chatModel.blockOP &&
      message == "[UnLockChat]"
    ) {
      chatModel.blockOP = false;
    } else if (
      chatModel.operatorType == OperatorType.Operator &&
      chatModel.blockOP
    ) {
      chatModel.blockOP = true;
    }

    if (
      chatModel.operatorType == OperatorType.QualityControl &&
      message == "[LockChat]"
    ) {
      chatModel.checkRoleQC = true;
    }
    if (
      chatModel.operatorType == OperatorType.QualityControl &&
      message == "[UnLockChat]"
    ) {
      chatModel.checkRoleQC = false;
    } else if (
      chatModel.operatorType == OperatorType.QualityControl &&
      chatModel.checkRoleQC
    ) {
      chatModel.checkRoleQC = true;
    }

    // if this is some other chat. set unread Count
    if (
      this.state.currentChatId != null &&
      this.state.currentChatId != messageRecieved.chatId
    ) {
      chatModel.unreadChatCount = chatModel.unreadChatCount + 1;
    }

    chats.set(messageRecieved.chatId, chatModel);
    this.setState({ chats: chats });

    if (messageRecieved.isReceived) {
      this.onNewMessageAudio.play();
    }

    this.Notification(messageRecieved);

    // Update Dictionary
    var localTimeDictionary = this.state.lastMessageTimeMap;
    localTimeDictionary.set(messageRecieved.chatId, moment());
    this.setState({ lastMessageTimeMap: localTimeDictionary });

    if (item.IsSent || messageRecieved.isSystemMessage) {
      EventEmitter.emit(Events.ScrollMainChatToBottom, null);
    } else {
      EventEmitter.emit(Events.ScheduleUnReadCount, null);
    }
  };

  private CheckMaskingTypeForMessage(
    user_id: string,
    managerId: string,
    message: string,
    chatModel: ChatModel | undefined,
    chatId: string
  ) {
    if (
      user_id == "0" &&
      managerId == "0" &&
      emailRegex.test(message) &&
      !message.includes("liveadmins.com")
    ) {
      if (this.state.userData.userLoginData.empCompId == "01") {
        var checkMasking = this.state.opTreeChats?.find(
          (item) => item.id == Number(chatModel?.info?.websiteId)
        );
        if (checkMasking?.maskingTypeID != "1") {
          this.updateEmailApi(message, chatId);
          message = checkMaskingTypeEmail(message);
        } else {
          this.updateEmailApi(message, chatId);
        }
      }
    }

    if (
      chatModel?.info.chatType != "facebook.com/marketplace" &&
      user_id == "0" &&
      managerId == "0" &&
      chatModel?.info.chatType != "TextUs" &&
      chatModel?.info.chatType != "facebook" &&
      phoneRegex.test(message)
    ) {
      if (this.state.userData.userLoginData.empCompId == "01") {
        var checkMasking = this.state.opTreeChats?.find(
          (item) => item.id == Number(chatModel?.info?.websiteId)
        );
        if (checkMasking?.maskingTypeID != "1") {
          this.updatePhoneApi(message, chatId);
          message = checkMaskingTypePhone(message).toString();
        } else {
          this.updatePhoneApi(message, chatId);
        }
      }
    }
    return message;
  }

  onVisitorData(visitorData: VisitorData) {
    var chats = this.state.chats;
    var visitorChats = Array.from(chats.values()).filter(
      (val) => val.info.visitorId == visitorData.visitorid.toString()
    );

    if (visitorChats.length == 0) {
      return;
    }

    var visitorChat = visitorChats[0];

    visitorChat.visitorData = visitorData;

    chats.set(visitorChat.info.chatId, visitorChat);

    this.setState({ chats: chats });
  }

  onInitData(initData: VisitorInitData) {
    var chats = this.state.chats;
    var valuesArray = Array.from(chats.values()).filter(
      (val) => val.info.visitorId == initData.Info.VisitorID
    );

    if (valuesArray.length == 0) {
      console.error("initData not found in state.", initData);
      return;
    }

    var val = valuesArray[0];
    val.visitorInfo = initData;

    chats.set(val.info.chatId, val);

    this.setState({ chats: chats });
  }

  persistStickyCurrentChat(currentChat: string) {
    this.setState({
      currentChatId: currentChat,
    });
    localStorage.setItem("currentChatId", currentChat);
  }

  getPersistedCurrentChat(): string | null {
    return localStorage.getItem("currentChatId");
  }

  async onLoad() {
    this.setState({ isLoading: true });

    await xmppChatService.disconnect();
    await chatService.connect();

    await this.markAvailability(true);

    var chats = this.props.hybridChat
      ? await this.getExistingChatsForHybridChat()
      : await this.getExistingChatsFromOpTree();

    await this.addExistingChats(chats);
  }

  getExistingChatsFromOpTree = async (): Promise<ChatModel[]> => {
    var opTreeChats = (
      await wglcsApiService.WebSiteAndChatListForOpTreeApi(
        this.state.userData.userLoginData.userId
      )
    ).data!.data;
    this.setState({ opTreeChats: opTreeChats });

    var existingChats = opTreeChats.filter((f) => f.parentID != -1);

    var chats = existingChats.map(
      (existingChat) =>
        ({
          info: {
            chatId: existingChat.id.toString(),
            websiteId: existingChat.parentID.toString(),
            visitorId: existingChat.descr,
            visitorName: existingChat.vname,
            VisitorJID: "",
            userName: "",
            autoGreetMessage: "",
            chatType: existingChat.textUsTypeName,
          },
          roomId: "room" + existingChat.id + "@conference.localhost",
          localConversation: [],
          unreadChatCount: 0,
          readMessages: [],
          visitorInformation: null!,
          visitorData: null!,
          visitorInfo: null!,
          previewMessage: "",
          operatorType: OperatorType.Operator,
          blockOP: false,
          checkRoleQC: false,
          color: "white",
          time: "",
          maskingType: existingChat.maskingTypeID,
          websiteTitle: existingChat.websiteTitle,
        } as ChatModel)
    );

    return chats;
  };

  getChatsForQaScreen(): Promise<AxiosResponse<ApiResult<QAChat[]>>> {
    var hasInterfaceAssigned = _.some(
      this.state.userData.interfaces,
      (iFace) =>
        iFace.interfaceName.toLowerCase() == "IsChangeNameHybrid".toLowerCase()
    );

    if (hasInterfaceAssigned) {
      return wglcsApiService.getChatsForQaScreenV1(
        this.state.userData.userLoginData.userId
      );
    }

    return wglcsApiService.getChatsForQaScreen(
      this.state.userData.userLoginData.userId
    );
  }

  getExistingChatsForHybridChat = async (): Promise<ChatModel[]> => {
    let existingChats = (await this.getChatsForQaScreen()).data!.data;
    this.setState({ qaChats: existingChats });

    var chats = existingChats.map(
      (existingChat) =>
        ({
          info: {
            chatId: existingChat.chatId.toString(),
            websiteId: existingChat.websiteId.toString(),
            visitorId: existingChat.visitorId.toString(),
            visitorName: existingChat.visitorName,
            VisitorJID: "",
            userName: existingChat.visitorName,
            autoGreetMessage: "",
            chatType: existingChat.textUsTypeName,
          },
          roomId: "room" + existingChat.chatId + "@conference.localhost",
          localConversation: [],
          unreadChatCount: 0,
          readMessages: [],
          visitorInformation: null!,
          visitorData: null!,
          visitorInfo: null!,
          previewMessage: "",
          operatorType: OperatorType.QualityControl,
          blockOP: false,
          checkRoleQC: false,
          color: "white",
          time: "",
          maskingType: "",
          websiteTitle: existingChat.websiteTitle ?? this.titleMissingCaption,
        } as ChatModel)
    );

    return chats.filter((chat) => !this.state.chats.has(chat.info.chatId));
  };

  async addExistingChats(chats: ChatModel[]) {
    var chatMap = new Map<String, ChatModel>();
    if (this.state.chats.size > 0) {
      chatMap = this.state.chats;
    }

    chats.map((chat) => chatMap.set(chat.info.chatId, chat));

    var currentChatId = this.state.currentChatId;
    if (
      this.state.currentChatId != null &&
      !chatMap.has(this.state.currentChatId)
    ) {
      currentChatId = null;
    }

    if (currentChatId == null && Array.from(chatMap.keys()).length > 0) {
      currentChatId = Array.from(chatMap.keys())[0].toString();
    }

    this.setState({
      chats: chatMap,
      currentChatId: currentChatId,
    });

    await this.reAttachExistingRooms();

    this.setState({ isLoading: false });
  }

  reAttachExistingRooms = async () => {
    if (xmppChatService.isStropheDisconnected()) {
      console.info(
        "[reAttachExistingRooms] Strophe Not Connected Yet. Checking in 3 second."
      );
      setTimeout(this.reAttachExistingRooms, 3000);
      return;
    }

    // Existing Chats Need to be Updated to New Rooms.
    this.state.chats.forEach(async (chat) => {
      await chatService.reAttachExistingRoom(chat);
      this.updateVisitorInfomation(chat.info.chatId);
    });
  };

  async markAvailability(isActive: boolean) {
    if (this.props.hybridChat) {
      await wglcsApiService.updateqcwindowstate(
        this.state.userData.userLoginData.userLog,
        isActive
      );
    } else {
      await wglcsApiService.updateoperatorwindowstate(
        this.state.userData.userLoginData.userLog,
        isActive
      );
    }
  }

  onNewChatReceived = async (message: MessageModel) => {
    if (message == null) {
      console.log("null message returned");
      return;
    }

    const { chatId } = message;

    var chats = this.state.chats;

    if (chats.has(chatId)) {
      console.warn(`chatId ${chatId} already exists. Cannot Create New Chat.`);
      return;
    }

    var chatModel: ChatModel = {
      info: message,
      localConversation: [],
      unreadChatCount: 0,
      readMessages: [],
      visitorInformation: null!,
      visitorData: null!,
      visitorInfo: null!,
      previewMessage: "",
      roomId: "",
      operatorType: this.props.hybridChat
        ? OperatorType.QualityControl
        : OperatorType.Operator,
      blockOP: false,
      checkRoleQC: false,
      color: "white",
      time: "",
      maskingType: "",
      websiteTitle: this.titleMissingCaption,
    };

    if (
      this.state.currentChatId != null &&
      this.state.currentChatId != chatId
    ) {
      // if this is some other chat. set unread Count
      chatModel.unreadChatCount = 1;
    }

    chats.set(chatId, chatModel);

    this.setState({ chats: chats });

    this.onNewChatAudio.play();

    if (this.state.currentChatId == null) {
      this.persistStickyCurrentChat(message.chatId);
    }

    await wglcsApiService.updatechatrunningstatus(parseInt(chatId));

    this.updateVisitorInfomation(chatId);

    chatService.reAttachExistingRoom(chatModel);

    if (!this.props.hybridChat) {
      await wglcsApiService.updateUserChatCount(
        this.state.userData.userLoginData.userId,
        this.state.chats.size
      );
    }
  };

  /// screen function
  onCompactTypeChange() {
    const { compactType: oldCompactType } = this.state;
    const compactTypeNew =
      oldCompactType === "horizontal"
        ? "vertical"
        : oldCompactType === "vertical"
        ? null
        : "horizontal";
    this.setState({ compactType: compactTypeNew });
  }

  /// screen function
  onLayoutChange() {
    // this.props.onLayoutChange(layout, layouts);
  }

  setName = async () => {
    if (this.state.currentChatId == null) {
      console.error("something went wrong");
    }

    var currentSelection = window.getSelection()!.toString().trim();

    if (currentSelection.match(phoneRegex)) {
      alert("Format is not correct");
      return;
    }
    var chats = this.state.chats;
    chats.get(this.state.currentChatId!)!.localConversation.forEach((item) => {
      if (!item.IsSent) {
        item.userName = currentSelection;
      }
    });
    this.setState({
      chats: chats,
    });
    chatService.updateNickName(
      chats.get(this.state.currentChatId!)!.info,
      currentSelection
    );

    await wglcsApiService.updateVisitorInfo({
      visitorId: chats.get(this.state.currentChatId!)!.info.visitorId,
      visitorName: currentSelection,
    });

    this.updateVisitorInfomation(this.state.currentChatId!);
  };

  setEmail = () => {
    if (this.state.currentChatId == null) {
      console.error("something went wrong");
    }

    var currentSelection = window.getSelection()!.toString().trim();

    if (!emailRegex.test(currentSelection.toLowerCase())) {
      alert("Format is not correct");
      return;
    }

    this.updateEmailApi(currentSelection, this.state.currentChatId!);
  };

  updateEmailApi = async (currentSelection: string, chatId: string) => {
    var visitorInfomation = this.state.chats.get(chatId)!.info;

    await wglcsApiService.updateVisitorInfo({
      visitorId: visitorInfomation.visitorId,
      emailAddress: currentSelection,
    });

    await this.updateVisitorInfomation(chatId!);
  };

  setPhone = async () => {
    if (this.state.currentChatId == null) {
      console.error("something went wrong");
    }

    var currentSelection = window.getSelection()!.toString().trim();
    if (currentSelection.length > 8) {
      if (!currentSelection.match(phoneRegex)) {
        alert("Format is not correct");
        return;
      }

      this.updatePhoneApi(currentSelection, this.state.currentChatId!);
    } else {
      alert("Format is not correct");
    }
  };

  updatePhoneApi = async (currentSelection: string, chatId: string) => {
    var visitorInfomation = this.state.chats.get(chatId)!.info;

    await wglcsApiService.updateVisitorInfo({
      visitorId: visitorInfomation.visitorId,
      phoneNumber: currentSelection,
    });

    await this.updateVisitorInfomation(chatId!);
  };

  endOperatorBreak = () => {
    if (this.state.operatorBreakData == null) {
      console.error("something wrong happened. operatorBreakData is null");
      return;
    }

    wglcsApiService.updatebreakendtime({
      breakId: this.state.operatorBreakData.breakId,
    });
    this.markAvailability(true);

    this.setState({ isOperatorOnBreak: false, operatorBreakData: null });
  };

  startOperatorBreak = async () => {
    let userId = this.state.userData.userLoginData.userId;
    let userLogId = this.state.userData.userLoginData.userLog;

    var outStandingGreetCount =
      (await wglcsApiService.getoutstandinggreetsbyuser(userId)).data?.data ??
      0;

    if (outStandingGreetCount > 0) {
      this.toast?.show({
        severity: "info",
        summary: outStandingGreetCount + " outstanding greets.",
        detail: "Please wait until they are closed",
      });
      return;
    }

    var data = (await wglcsApiService.insertbreakinformation(userLogId)).data
      ?.data!;

    await wglcsApiService.updateoperatortimestamp({
      logId: userLogId,
      isActiveOperatorWindow: false,
    });
    await wglcsApiService.updatebreakstarttime({
      breakId: data.breakId,
      breakRequest: false,
    });
    this.markAvailability(false);

    this.setState({ isOperatorOnBreak: true, operatorBreakData: data });
  };

  googleSearch = () => {
    if (this.state.currentChatId == null) {
      console.error("something went wrong");
    }

    var currentSelection = window.getSelection()!.toString().trim();
    window.open("https://www.google.com/search?q=" + currentSelection);
  };

  updateVisitorInfomation = async (chatId: string) => {
    var result3 = await wglcsApiService.getvisitorinformationbychatid(chatId);

    var chats = this.state.chats;
    chats.get(chatId)!.visitorInformation = result3.data!.data[0];

    this.setState({ chats: chats });
  };

  UpdateUnReadCount = (model: UnReadCountModel) => {
    var { chatId, unReadMessageIds, readMessageIds } = model;

    var chats = this.state.chats;
    var chatModel = chats.get(chatId);

    if (chatModel == null) {
      console.error(`No Chat Found for given ChatId: ${chatId}`);
      return;
    }

    chatModel.readMessages = _.uniq(
      chatModel.readMessages.concat(readMessageIds)
    );

    var unreadChatCount = unReadMessageIds.filter(
      (f) => chatModel!.readMessages.indexOf(f) == -1
    );

    chatModel.unreadChatCount = unreadChatCount.length;

    chats.set(chatId, chatModel);

    this.setState({ chats: chats });
  };

  getFacebookUrl(value: string) {
    var website_url = this.state.opTreeChats.find(
      (element) => element.id.toString() == value
    );

    return website_url?.websiteURL;
  }

  ShowSnackbar = (check: boolean, message: string) => {
    this.setState({ isSnackbarVisible: check, showSnackBarMessage: message });
  };

  handleCloseSnackbar = (visible: boolean) => {
    this.setState({ isSnackbarVisible: visible });
  };

  backgroundColor(chat: ChatModel) {
    if (chat.color == "white" && chat.info.chatId == this.state.currentChatId)
      return "white";
    else if (
      chat.color == "white" &&
      chat.info.chatId != this.state.currentChatId
    )
      return "#eee";
    else if (chat.color == "#e1e1e1") return "#e1e1e1";
    else if (chat.color == "#ffe0e0") return "#ffe0e0";
    else return "orange";
  }

  backgroundColorForQC(chat: ChatModel) {
    if (chat.info.chatId == this.state.currentChatId) return "white";
    else return "#eee";
  }

  calculateHeight = () => {
    if (
      Array.from(this.state.chats.keys()).length >= 5 &&
      Array.from(this.state.chats.keys()).length < 10
    ) {
      return 275;
    } else if (Array.from(this.state.chats.keys()).length > 10) {
      return 250;
    } else return 295;
  };

  lastMessages = (chat: ChatModel) => {
    return (
      <>
        {this.getLastMessage(
          chat.localConversation[chat.localConversation.length - 1]
        )}
        {this.getLastMessage(
          chat.localConversation[chat.localConversation.length - 2]
        )}
        {this.getLastMessage(
          chat.localConversation[chat.localConversation.length - 3]
        )}
      </>
    );
  };

  getLastMessage = (item: VisitorConversation | null | undefined) => {
    return (
      <>
        {item?.messageText ? (
          <div className="messages">
            <i className={item?.IsSent ? "fa fa-reply" : "fa fa-share"}></i>
            {item?.messageText ?? ""}
          </div>
        ) : null}
      </>
    );
  };

  RenderChatList = () => {
    var grouped = _.groupBy(
      Array.from(this.state.chats.values()),
      (g) => g.websiteTitle
    );

    return _.map(grouped, (chats) => {
      return (
        <>
          <div className="chat-header d-none d-lg-block">
            <i className="fa fa-users"></i>
            {chats[0].websiteTitle}
          </div>
          <ul id="tab-button" className="nav nav-tabs" role="tablist">
            {chats.map((chat) => this.RenderSingleChat(chat))}
          </ul>
        </>
      );
    });
  };

  RenderSingleChat = (chat: ChatModel) => {
    return (
      <>
        <li
          key={chat.info.chatId.toString()}
          onClick={() => {
            this.persistStickyCurrentChat(chat.info.chatId.toString());
          }}
        >
          <a
            style={{
              background: this.props.hybridChat
                ? this.backgroundColorForQC(chat)
                : this.backgroundColor(chat),
            }}
            className={
              "nav-item nav-link" +
              (this.state.currentChatId == chat.info.chatId ? " active" : "")
            }
            data-toggle="tab"
            role="tab"
            aria-selected="true"
          >
            <span className="link-font">
              {chat.info?.chatType == "TextUs" && (
                <i className="pi pi-mobile "></i>
              )}
              {chat.info?.chatType == "facebook" && (
                <i
                  style={{ marginRight: "10px" }}
                  className="pi pi-facebook fa-2x"
                ></i>
              )}
              {chat.info?.chatType == "facebook"
                ? this.getFacebookUrl(chat.info.websiteId)
                : window.innerWidth > 768 && getUrl(chat)}
            </span>

            <span
              style={{ marginLeft: "10px" }}
              className="menu-item-badge menu-single-item-badge badge badge-danger badge-pill"
            >
              {chat.unreadChatCount > 0 ? chat.unreadChatCount : null}
            </span>

            <div className="d-none d-lg-block">{this.lastMessages(chat)}</div>

            <div className="messages-icons d-block d-lg-none">
              <i className="fa fa-commenting-o"></i>
            </div>
          </a>
        </li>
      </>
    );
  };

  RenderMainChat = () => {
    return (
      this.state.currentChatId != null &&
      this.state.chats.size > 0 && (
        <MainChat
          operatorType={
            this.props.hybridChat
              ? OperatorType.QualityControl
              : OperatorType.Operator
          }
          lengthChat={this.calculateHeight()}
          selectedChat={this.state.chats.get(this.state.currentChatId)!}
          qaChat={this.state.qaChats.find(
            (element) => element.chatId.toString() == this.state.currentChatId
          )}
          optChat={this.state.opTreeChats}
          showSnackbar={this.ShowSnackbar}
        />
      )
    );
  };
  RenderMainChatWithContextMenu = () => {
    if (this.props.hybridChat) {
      return this.RenderMainChat();
    }

    return (
      <>
        <ContextMenuTrigger id="context-menu-2" disable={false}>
          {this.RenderMainChat()}
        </ContextMenuTrigger>
        <ContextMenu
          appendTo="body"
          hideOnLeave={false}
          preventHideOnScroll={true}
          preventHideOnResize={true}
          id="context-menu-2"
          animation="zoom"
        >
          <ContextMenuItem onClick={() => this.setName()}>
            Set Name
          </ContextMenuItem>
          <ContextMenuItem onClick={() => this.setEmail()}>
            Set Email
          </ContextMenuItem>
          <ContextMenuItem onClick={() => this.setPhone()}>
            Set Phone
          </ContextMenuItem>
          <ContextMenuItem onClick={() => this.googleSearch()}>
            Google Search
          </ContextMenuItem>
        </ContextMenu>
      </>
    );
  };

  EmailForm = async (chatID: string) => {
    var currentChat = this.state.chats.get(chatID);

    let visiterId = currentChat?.info?.visitorId;
    let chatId = currentChat?.info?.chatId;
    let webId = currentChat?.info?.websiteId;
    let uId = this.state.userData.userLoginData.userId;
    var empCompId = this.state.userData.userLoginData.empCompId;

    utils.EmailForm(
      parseInt(visiterId?.toString() ?? ""),
      chatId,
      webId,
      uId,
      currentChat?.localConversation[0]?.timeStamp,
      empCompId
    );
  };

  render() {
    if (this.state.isLoading) {
      return <Spinner />;
    } else {
      return (
        <div>
          <Toast ref={(r) => (this.toast = r as any)} />
          <div onCopy={() => this.setState({ draggable: false })}>
            <ResponsiveReactGridLayout
              isDraggable={true}
              layouts={this.state.layouts}
              onBreakpointChange={(breakpoint) =>
                this.setState({ currentBreakpoint: breakpoint })
              }
              onLayoutChange={this.onLayoutChange}
              measureBeforeMount={true}
              useCSSTransforms={this.state.mounted}
              compactType={this.state.compactType}
              preventCollision={!this.state.compactType}
            >
              <div className="shadow card chat-menus" key="f">
                <div className="active-chats d-none d-lg-block">
                  Active Chats
                </div>
                {this.RenderChatList()}
              </div>
              <div
                className="card controlOverflow chat-box "
                key="a"
                onDoubleClick={() =>
                  this.setState({ draggable: !this.state.draggable })
                }
              >
                <div className="content-wrapper">
                  <div className="content cont">
                    <div className="content__section">
                      <div className="music-box-holder">
                        <div className="tabs">
                          {this.RenderMainChatWithContextMenu()}

                          {this.state.chats.size == 0 && (
                            <>
                              <div className="no-active-chat">
                                <img className="imgs" src={NoChat} />
                                <span
                                  className={
                                    "nav-item nav-link font-weight-bold height-auto "
                                  }
                                  style={{ textAlign: "center" }}
                                >
                                  No Active Chats
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={
                  window.innerWidth <= 768 && this.state.showContainer
                    ? "d-none"
                    : "card tabs controlOverflow"
                }
                key="e"
              >
                {this.state.currentChatId != null && (
                  <OperatorMessagesComponent
                    languageId={
                      this.state.userData?.userLoginData?.languageId || 0
                    }
                    userId={this.state.userData?.userLoginData?.userId || 0}
                    websiteId={parseInt(
                      this.state.chats.get(this.state.currentChatId)?.info
                        ?.websiteId || "0"
                    )}
                  />
                )}
              </div>

              <div
                className={`card shadow  mb-4 visit-info controlOverflow ${
                  !this.state.showContainer ? "d-none" : "d-flex"
                }`}
                key="b"
              >
                <div className="card-header v-info d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold pull-left">
                    Visitor Information
                  </h6>
                </div>
                {this.state.currentChatId != null && (
                  <VisitorInformationComponent
                    visitorData={
                      this.state.chats.get(this.state.currentChatId)
                        ?.visitorData!
                    }
                    visitorInitData={
                      this.state.chats.get(this.state.currentChatId)
                        ?.visitorInfo!
                    }
                  />
                )}
                <div
                  className={`card live-info-card controlOverflow ${
                    !this.state.showContainer && "d-none"
                  }`}
                  key="c"
                >
                  {this.state.currentChatId != null && (
                    <LiveInfoCard
                      initData={
                        this.state.chats.get(this.state.currentChatId)
                          ?.visitorInfo
                      }
                      visitorData={
                        this.state.chats.get(this.state.currentChatId)
                          ?.visitorData
                      }
                    />
                  )}
                </div>
              </div>

              <div
                className={`card system-info-card controlOverflow ${
                  !this.state.showContainer && "d-none"
                }`}
                key="c"
              >
                {this.state.currentChatId != null && (
                  <SystemInfo
                    initData={
                      this.state.chats.get(this.state.currentChatId)
                        ?.visitorInfo
                    }
                  />
                )}
              </div>

              <div
                className={`card quick-links-card controlOverflow ${
                  !this.state.showContainer && "d-none"
                }`}
                key="d"
              >
                <div className="card-header d-flex flex-row align-items-center justify-content-between">
                  <h6 className="m-0 font-weight-bold pull-left">Click Path</h6>
                </div>
                {this.state.currentChatId != null && (
                  <ClickPath
                    initData={
                      this.state.chats.get(this.state.currentChatId)
                        ?.visitorInfo
                    }
                  />
                )}
              </div>
            </ResponsiveReactGridLayout>
          </div>
          <SnackBar
            open={this.state.isSnackbarVisible}
            severity="error"
            message={this.state.showSnackBarMessage}
            handleClose={(e) => this.handleCloseSnackbar(e)}
          />
        </div>
      );
    }
  }
}
export default ChatComponent;

function setAudio(arg0: HTMLAudioElement) {
  throw new Error("Function not implemented.");
}

const Sound = ({ soundFileName, ...rest }) => (
  <audio autoPlay src={`sounds/${soundFileName}`} {...rest} />
);
