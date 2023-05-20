

export interface LoginModel {
    userName: string,
    password: string,
    licenseKey: string
    ipAddress: string
    computerName: string
}
export interface UserInfo {
    companyName: string
    employeeCompanyId: string,
    employeeEmail: "kanza.nisar1@maavratech.com"
    employeePhone: string,
    userId: Number,
    userName: string
}
export interface QAChat {
    chatId: number,
    userId: number,
    websiteId: number,
    chatStartTime: Date,
    chatEndTime: Date,
    chatRating: string,
    visitorId: number,
    typeID: number,
    runningStatus: true,
    closeStatus: true,
    isUserTyping: true,
    visitorName: string,
    chatInitiate: true,
    greetId: number,
    chatToSale: true,
    chatStartPage: string,
    activeChat: true,
    dnd: true,
    block: true,
    visitorPhone: string,
    visitorEmail: string,
    appointment: true,
    isVB: true,
    echo: true,
    isMentor: true,
    textUsTypeId: number,
    domainName: string,
    textUsTypeName: string,
    websiteTitle: string
}

export interface IDestroyRoom {
    chatId: string, 
    showMailForm: boolean
}

export interface PreviewMessage {
    chatId: string;
    message: string;
}

export interface AllBlockedIps {
    id: number,
    websiteId: number,
    ipAddress: string,
    domainName: string
}

export interface UnReadCountModel {
    chatId: string;
    unReadMessageIds: string[];
    readMessageIds: string[];
}

export interface IOperationResult<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface LoginResponseModel {
    data: LoginResponse;
    error: string;
    msg: string;
    status: boolean;
}

export interface LoginResponse {
    accessToken: AccessTokenModel;
    userLoginData: UserData;
    interfaces: RoleInterface[]
}

export interface CookiesLogin {
    userName: string,
    password: string,
    licenseKey: string
}
interface AccessTokenModel {
    auth_token: string;
    expires_in: number; // TODO. Logout User on Expired Token
    id: string;
    refresh_token: string;
}

export interface UserData {
    apiCode: string;
    companyName: string;
    companyType: string;
    currentTime: string;
    dashboardEmail: string;
    empCompId: string;
    imagePath: string;
    languageCode: string;
    languageId: number;
    message: string;
    roleName: string;
    success: boolean;
    twoFactorAuthentication: string;
    userEmail: string;
    userId: number;
    userLog: number;
    userPassword: string;
    username: string;
}

export interface MessageModel {
    chatId: string,
    websiteId: string,
    visitorId: string,
    visitorName: string,
    VisitorJID: string,
    autoGreetMessage: string,
    userName: string,
    chatType: string;
}
export const OpenFireChatType = 'Chat';
export const hybridPanelLink = '/hybridChat';
export const agentPanelLink = '/chat';

export class ChatMessageModel {
    chatId: string = '';
    user_id: string = '';
    visitor_name: string = '';
    message: string = '';
    timeStamp: string = '';
    roomId: string = '';
    chatType: string = '';
    managerId: string = '';
    nickName: string = '';

    constructor(
        chatId: string,
        user_id: string,
        visitor_name: string,
        message: string,
        timeStamp: string,
        roomId: string,
        chatType: string,
        managerId: string,
        nickName: string) {

        this.chatId = chatId;
        this.user_id = user_id;
        this.visitor_name = visitor_name;
        this.message = message;
        this.timeStamp = timeStamp;
        this.roomId = roomId;
        this.chatType = chatType;
        this.managerId = managerId;
        this.nickName = nickName;
    }

    get isReceived(): boolean {
        return parseInt(this.user_id) === 0;
    }

    get isSent(): boolean {
        return parseInt(this.user_id) >= 0;
    }

    get isSystemMessage(): boolean {
        var intUserId = parseInt(this.user_id);
        return intUserId === -2444 || intUserId === -7616;
    }
}

export interface ChatModel {
    info: MessageModel;
    visitorInformation: VisitorInformationModel;
    visitorData: VisitorData;
    visitorInfo: VisitorInitData;
    localConversation: VisitorConversation[];
    roomId: string;
    unreadChatCount: number;
    readMessages: string[]
    previewMessage: string;
    operatorType: OperatorType;
    blockOP: boolean,
    checkRoleQC: boolean,
    color: string,
    time: string,
    maskingType: string;
    websiteTitle: string;
}

export enum OperatorType {
    QualityControl,
    Operator
}

export interface SignalRChatMessage {
    Agent: null;
    Besttimereach: string;
    CellNo: string;
    ChatId: string;
    ChatType: string;
    DomainName: string | null;
    EndTime: string;
    GreetId: string;
    IsCustomMessage: string;
    Lang: string | null;
    ManagerId: string;
    MessageBody: string;
    Miscellaneous: string | null;
    NickName: string;
    Sender: string | null;
    SoftwareUserId: string;
    Subject: string | null;
    TimeStamp: string;
    TransferUserId: string | null;
    UserId: string;
    VisitorId: string;
    VisitorName: string;
    WebsiteId: string;
    WebsiteUrl: string;
}

export interface ChatHubServerProxy {
    addGroup: (connectionId, groupName, callerName) => any,
    addInvolveChatState: (name, chatId) => any,
    addIronFxState: (userName, visitorId, userId, num, websiteId, chatId, userids) => any,
    addOnlineUser: (langId, userId) => any,
    addParticipant: (ChatId, selectedUser, UserNameAndInterfaceName, E_ID) => any,
    assignUsers2Webiste: (UserId, ConnectionId, LangId) => any,
    assignUsers2WebisteQc: (UserId, LangId) => any,
    broadcastAlert: (userId, alertType) => any,
    broadcastBreakNotification: (data) => any,
    broadcastSms: (data) => any,
    broadcastSystemInfo: (json) => any,
    cSR_DisconnectedMe: () => any,
    chatSentNotification: (chatId, userId) => any,
    checkTextUsTimeSlotOnExpiry: (websiteId, visitorId, chatId) => any,
    cleanRooms: () => any,
    createBtAutoGreeting: (reqObj, websiteId) => any,
    csaAckChat: (chatId, greeterConnectionId) => any,
    destroyRoom: (msgPacket) => any,
    dumpConversation: (msgObj) => any,
    emit: (groupKey) => any,
    emitReact: (groupKey) => any,
    extraction: (botMind, message, currentStage, isClosedBot, selectedOptions, flag, websiteId, visitorId, chatId) => any,
    fromWeChatToAgent: (businessNumber, visitorNumber, msgType, message) => any,
    fromWebhookToAgent: (name, message, userId, pageId, appId) => any,
    getAllAssignedChat_TextUs: (userid) => any,
    getAllData: (chatId) => any,
    getAllDataBotChat: (chatId) => any,
    getAllDataExpiry: (chatId) => any,
    getAllFacebookData: (chatId, selectedUser) => any,
    getAvailableUser: (langId, websiteId, chatId, visitorId, visitorName, message, websiteName) => any,
    getAvailableUserNew: (langId, websiteId, chatId, visitorId, visitorName, message, websiteName) => any,
    getBotMessage: (website, mindFromClient, isClosed, currentStageValue) => any,
    getChatMessageIdWithStatus: (chatId) => any,
    getDepartmentDataForOpenBot: (websiteId) => any,
    getGreeting: (websiteId) => any,
    getPreviousIronTracking: (userId) => any,
    getQuedStats: (websiteId, visitorId, chatId, langId) => any,
    getRevampGreeting: (websiteId) => any,
    getSystemInfo: (json) => any,
    getUserIdOrConnId: (useridorConnId) => any,
    getUserIdOrConnIdWithLogs: (useridorConnId, chatId) => any,
    getVerbiageByWebsite: (WebsiteId) => any,
    getVideoChatParticipants: (id) => any,
    getVideoIdByChatId: (chatId) => any,
    getWeChatToken: (fromUser, toUser, message) => any,
    getWebRtcStatus: (vId) => any,
    greeterAckChat: (chatId) => any,
    invitationAck: (visitorId, chatId) => any,
    invitationAckForTransfer: (visitorId, chatId) => any,
    inviteOperator: (chatid, visitorId, visitorname, operatorUserId) => any,
    inviteOperatorWithReason: (chatid, visitorId, visitorName, operatorUserId, reasonPacket, firstMessage) => any,
    invokeChatMessage: (chatid, message, userType, reasonPacket) => any,
    invokeMessage: (chatid, message, userType) => any,
    invokeMessageVerbiage: (message, websiteId, reasonPacket, userId, websiteUrl) => any,
    isCSA_Available: (langId, websiteId) => any,
    isVideoChatRunning: (id) => any,
    leaveChatQc: (selectedUser, websiteid, langid) => any,
    leaveFromQuedChats: (chatid) => any,
    leaveParticipant: (ChatId, userId) => any,
    leaveRoom: (chatId) => any,
    leaveTextUsChatExpiry: (msgPacket) => any,
    markAttemptDumpsChatLog: () => any,
    markingChatAckLogs: (visitorId, chatId, userId, actionType, connectionStatus) => any,
    nluLastMessage: (chatId) => any,
    notifyMessageFromClient: (filePath, chatid) => any,
    notifyMessageFromClient_TextUs_WithNoReply: (key, langid, message) => any,
    notifyOnChatSent: (chatId, message) => any,
    quedChatInsert: (chatid, visitorId, websiteId, userid, langId) => any,
    rasaNlu: (chatId, message, lang, agent) => any,
    rasaNluFaceBookNewChat: (chatId, message, userId, pageId, token, appId, websiteId, visitorId, greetId, selecteuser) => any,
    rasaNluFaceBookRunningChat: (chatId, message, userId, pageId, appId, websiteId, senderName) => any,
    rasaNluUpdated: (msgObj, lang, agent, domainName) => any,
    reAssignedChats: (chatIds, visitorIds, websiteIds, userId) => any,
    registerMe: (userName, userid) => any,
    registerOnlineUser: (userId) => any,
    registerOperator: (userId) => any,
    registerUser: (userId) => any,
    registerVisitor: () => any,
    registerWebrtcUser: (userId) => any,
    relogged: (chatid, UserNameAndInterfaceName, operatorUserId) => any,
    reloggedNew: (msgObj) => any,
    removeAlternateKeys: (title, Id) => any,
    removeCSRChat: (userId, chatId, langId) => any,
    removeNotificationInfo: (userId) => any,
    removeVisitorMind: (visitorId) => any,
    reqToGetNLUResponse: (msgObj) => any,
    routChatToOperatorQc: (websiteid, langid, caller) => any,
    routeChatNotification: (websiteId) => any,
    routeWebrtcPacket: (json, type) => any,
    saveFakeVisitorInfo: (visitorId, referer, websiteId) => any,
    saveNotificationInfo: (json) => any,
    saveVisitorVerbiageHubs: (LstInsertVerbiage) => any,
    send: (visitorId, data, referer, websiteId) => any,
    sendBT: (visitorId, data, websiteId) => any,
    sendBotMessage: (msgFromClient, nluObject) => any,
    sendBreakAlert: (userId) => any,
    sendBuzz: (json) => any,
    sendChatInfo: (chatid, wid) => any,
    sendGreeting: (visitorId, websiteId, chatId, greeting, isVB) => any,
    sendInvitation: (msg) => any,
    sendInvitationForBettyChat: (msg, lang, agent, domainName) => any,
    sendInvitationForBotChat: (msg, lang, agent, domainName) => any,
    sendInvitationTextUs: (msg) => any,
    sendInvitationTextUsDealerOnly: (msg) => any,
    sendInvitationTextUsExpiryChatIn: (msgToSend) => any,
    sendInvolve: (json) => any,
    sendIronFxChat: (websiteid, visitorId, url, connectionId, userId, userName, customMessage) => any,
    sendLead: (visitorId) => any,
    sendMessage: (msgObj: SignalRChatMessage) => any,
    sendMessageBettyObject: (msgFromClient, nluObject) => any,
    sendMessageForBettyChat: (msgObj, lang, agent, domainName) => any,
    sendMessageForBotChat: (msgObj, lang, agent, domainName) => any,
    sendMessageNluObject: (msgFromClient, nluObject) => any,
    sendMessageObject: (msgFromClient, nluObject) => any,
    sendTracking: (WebsiteId, VisitorId, url, ConnectionId) => any,
    sendUrl: (vid, wid) => any,
    sendUrlFail: (vid, wid) => any,
    sendWeChatMessage: (fromUser, toUser, message) => any,
    sendtofb: (pageId, userId, message, token, chatId, appId) => any,
    startTimer: () => any,
    stopTracking: (GroupKey) => any,
    storeOfflineData: (pageId, userId, message, sender) => any,
    storeWeChatOfflineData: (businessNumber, visitorNumber, message, msgType) => any,
    stunServers: () => any,
    subscribeBreakAlerts: () => any,
    subscribeSms: () => any,
    transferBotChat: (msg) => any,
    transferChat: (msgObj) => any,
    transferFacebookBotChat: (msg, toUserId) => any,
    transferToBot: (visitorId, websiteId, chatId, visitorMind, chatStarTime, userAgent, userId) => any,
    tryCreateGroup: (connectionId, msgPacket) => any,
    turnServers: () => any,
    unAssignUsersFromWebsitesTextUsQc: (userId) => any,
    unRegisterWebrtcUser: (userId) => any,
    unSubscribeSms: () => any,
    unSubscribeUser: () => any,
    updateAckAttempts: (websiteid, visitorid, type) => any,
    updateChatFillerTime: (visitorId, chatId) => any,
    updateChatFirstFillerTime: (visitorId, chatId) => any,
    updateChatTrfTime: (visitorId, chatId, userId, toTrfUserId) => any,
    updateGreeterStatus: (chatId) => any,
    updateGreetersCanned: () => any,
    updateMessageStatus: (chatId, messageId, messageStatus) => any,
    updateVisitorMind: (visitorId, websiteId, chatId, visitorMind, chatStarTime, userAgent) => any,
    visitorData: () => any,
    weChatSendTextMessage: (token, toUser, message) => any,
    writeFullyLoadedVisitor: (visitorId) => any
}

export interface VisitorChatHistory {
    chatId: Number,
    timeStamp: Date,
    roomId: string | null;
    conversation: VisitorConversation[]
}

export interface WebsiteBlockKeywords {
    keywordID: Number,
    websiteId: Number,
    websiteTitle: string,
    domainName: string,
    keyword: string
}

export interface AvailableUserForTransfer {
    userName: string,
    userId: number,
    currentChats: Number,
    employeeEmail: string
}

export interface VisitorConversation {
    chatMessageId: string,
    chatId: string,
    messageText: string,
    timeStamp: string,
    userId: Number | null,
    managerId: Number | null,
    userName: String | null,
    departmentName: String | null,
    IsSent: boolean,

}

export interface VisitorIpInformation {
    expr1: string,
    ip_from: Number,
    ip_to: Number,
    country_code: String,
    country_name: String,
    continent_code: String,
    continent_name: String,
    time_zone: String,
    region_code: String,
    region_name: String,
    owner: String,
    city_name: String,
    county_name: String,
    latitude: Number,
    longitude: Number,
    chatCount: Number
}

export interface VisitorInformationModel {
    visitorId: Number,
    visitorName: String,
    visitorPhone: String,
    visitorEmail: String,
    accountNumber: String,
    general: true,
    promotions: true,
    deposits: true,
    withdrawals: true,
    mT4: true
}

export interface WebsiteCannedMessages extends ICannedMessage {
    webSiteId: Number;
    messageID: Number;
    messageText: string;
    parentId: Number;
    languageId: Number;
    color: string;
    sortBy: Number;
}
export interface Websites {
    adStatus: Number;
    autoGreetTime: Number;
    city: string;
    clientCoordinator: Number;
    closing: string;
    companyId: Number;
    country: string;
    domainName: string;
    greeting: string;
    industry: string;
    priorityLanguage: Number;
    salesPerson: Number;
    status: boolean;
    timeZone: string;
    websiteId: Number;
    websiteTitle: string
}
export interface LanguagesMdl {
    languageId: Number;
    languageName: string;
    shortForm: string;
}
export interface UnSentChatMDL {
    userId:Number,
    userName:string;
    notSentChats:Number;
    avgPendingTime:string;
    languageId:Number;
    chats:string;
}
export interface PersonalCannedMessages extends ICannedMessage {
    id: Number;
    descr: string;
    parentId: Number;
    color: string;
    serialId: string;
    sortBy: Number;
    pcmType: string;
}

export interface PersonalCannedMessages1 {
    userId: Number;
    messageID: Number;
    messageText: string;
    parentId: Number;
    color: string;
    languageId: Number;
    serialId: string;
    sortBy: Number;
    pcmType: string;
}

export interface PushContentMDL {
    pushID: Number;
    websiteID: Number;
    url: string;
    pageTitle: string;
    parentId: Number;
    userTrainedOn: string;
    websiteInfo: string
}

export interface CannedMessages extends ICannedMessage {
    id: Number;
    descr: string;
    parentId: Number;
    color: string;
    webSiteId: Number;
}

export interface CannedMessageWithExpiry {
    websiteId: Number,
    messageID: Number,
    messageText: string,
    parentId: Number,
    languageId: Number,
    color: string,
    sortBy: Number,
    expiryDate: string,
    ticketNo: string
}

export interface ICannedMessage {
    readonly parentId: Number,
    readonly color: string,
    messageText: string,
    readonly messageID: Number
}


export interface WebsitePushPages {
    pushID: Number,
    websiteID: Number,
    url: String,
    pageTitle: String,
    parentId: Number,
    userTrainedOn: {
        opTrainedId: Number,
        websiteId: Number,
        userId: Number,
        opTrainedRating: String,
        statusId: Number,
        languageId: Number,
        status: true,
        userDepartments: String,
        websiteInfo: {
            websiteId: Number,
            companyId: Number,
            autoGreetTime: Number,
            websiteTitle: String,
            domainName: String,
            priorityLanguage: Number,
            greeting: String,
            closing: String,
            status: true,
            timeZone: String,
            adStatus: Number,
            industry: String,
            liveDate: Date,
            country: String,
            region: String,
            state: String,
            city: String,
            salesPerson: Number,
            clientCoordinator: Number,
            color: String,
            blockOptions: Number,
            chatTransferLimit: Number,
            serviceType: Number,
            companyInfo: {
                companyId: Number,
                companyName: String,
                companyEmail: String,
                companyPhone: String,
                companyFax: String,
                employeeCompanyId: String,
                address: String,
                emailDomain: String,
                smtpServer: String,
                port: String,
                ssl: Number,
                status: true,
                companyColor: String,
                smtpId: Number,
                employeeCompany: {
                    employeeCompanyId: String,
                    companyName: String,
                    address: String,
                    phoneNumber: String,
                    contactPerson: String,
                    contactEmail: String,
                    status: true,
                    companyTypeId: Number,
                    fax: String,
                    smtpId: Number,
                    companyColor: String,
                    creationDate: Date,
                    createdBy: Number,
                    apiCode: String,
                    parentCompany: String,
                    allowedAttempts: Number,
                    passwordExpiryDays: Number,
                    lockDuration: Number,
                    companyInfo: [
                        null
                    ]
                },
                userSmtpEmailAddress: {
                    userAddressId: Number,
                    userId: Number,
                    smtpId: Number,
                    emailAddress: String,
                    password: String
                },
                smtpInfo: {
                    smtpId: Number,
                    smtpName: String,
                    emailDomain: String,
                    smtpServer: String,
                    port: String,
                    ssl: true,
                    employeeCompanyId: String,
                    username: String,
                    password: String
                }
            },
            userTrainedOn: [
                null
            ],
            companyType: {
                companyTypeId: Number,
                companyTypeName: String,
                status: true
            }
        }
    },
    websiteInfo: {
        websiteId: Number,
        companyId: Number,
        autoGreetTime: Number,
        websiteTitle: String,
        domainName: String,
        priorityLanguage: Number,
        greeting: String,
        closing: String,
        status: true,
        timeZone: String,
        adStatus: Number,
        industry: String,
        liveDate: Date,
        country: String,
        region: String,
        state: String,
        city: String,
        salesPerson: Number,
        clientCoordinator: Number,
        color: String,
        blockOptions: Number,
        chatTransferLimit: Number,
        serviceType: Number,
        companyInfo: {
            companyId: Number,
            companyName: String,
            companyEmail: String,
            companyPhone: String,
            companyFax: String,
            employeeCompanyId: String,
            address: String,
            emailDomain: String,
            smtpServer: String,
            port: String,
            ssl: Number,
            status: true,
            companyColor: String,
            smtpId: Number,
            employeeCompany: {
                employeeCompanyId: String,
                companyName: String,
                address: String,
                phoneNumber: String,
                contactPerson: String,
                contactEmail: String,
                status: true,
                companyTypeId: Number,
                fax: String,
                smtpId: Number,
                companyColor: String,
                creationDate: Date,
                createdBy: Number,
                apiCode: String,
                parentCompany: String,
                allowedAttempts: Number,
                passwordExpiryDays: Number,
                lockDuration: Number,
                companyInfo: [
                    null
                ]
            },
            userSmtpEmailAddress: {
                userAddressId: Number,
                userId: Number,
                smtpId: Number,
                emailAddress: String,
                password: String
            },
            smtpInfo: {
                smtpId: Number,
                smtpName: String,
                emailDomain: String,
                smtpServer: String,
                port: String,
                ssl: true,
                employeeCompanyId: String,
                username: String,
                password: String
            }
        },
        userTrainedOn: [
            null
        ],
        companyType: {
            companyTypeId: Number,
            companyTypeName: String,
            status: true
        }
    }
}

export interface ApiResult<T> {
    status: boolean;
    msg: string;
    data: T;
    error: any
}

export interface VisitorData {
    websiteid: String,
    visitorid: Number,
    postType: String,
    actionurl: String,
    websiteurl: String,
    active: boolean,
    time: Number
}

export interface VisitorInitData {
    BT: {
        filter: [],
        visitorid: any,
        websiteurl: any,
        websiteid: any,
        postType: any,
        actionurl: any,
        pid: any,
        flag: null
    },
    SK: any,
    VT: VisitorInitDataVT[],
    VLF: any,
    Info: {
        VisitorID: String,
        URL: String,
        OS: String,
        Browser: String,
        Device: String,
        Referrer: String,
        chatDuration: any,
        DateTimeOnSite: String,
        FirstVisitDate: String,
        PreviousVisits: String,
        PreviousChats: String,
        PreviousMessageCount: any,
        GreetingMsg: any,
        IsVBGreeting: false,
        ChatId: number,
        AckAttempts: String,
        Timezone: any,
        VisitorType: any,
        TimeOnSite: String,
        visitorId: String,
        chatId: String
    },
    Id: String
}

export interface VisitorInitDataVT {
    Status: number;
    URL: string;
    TimeSpend: any;
}

export interface OperatorBreakModel {
    breakId: Number,
    breakStartTime: string,
    breakEndTime: string,
    logId: Number,
    breakTypeId: Number,
    breakRequest: boolean,
    breakApproved: boolean,
    approvedBy: string,
    breakApplyTime: string
}

export enum CannedType {
    Website,
    User
}

export interface OperatorChat {
    maskingTypeID: string;
    id: Number,
    descr: string,
    vname: string,
    parentID: Number,
    chatInitiate: Number,
    country: string,
    timeZone: string,
    employeeCompany: string,
    involveColumn: Number,
    industry: string,
    color: string,
    chatTransferLimit: Number,
    textUsTypeName: string,
    chatIn: true,
    userID: Number,
    websiteURL: string,
    websiteTitle: string,
    autoTransferLimit: Number
}

export interface AgentsMDL {
    userId: number,
    userName: string,
    userPassword: string,
    roleId: Number,
    roleName: string,
    alottedBreak: string,
    userNoOfChats: Number,
    languageId: Number,
    employeeFname: string,
    employeeLname: string,
    employeeEmail: string,
    employeePhone: string,
    companyId: string,
    status: boolean,
    companyName: string,
    involveContact: string,
    accountVerification: boolean,
    reusePassword: boolean,
    imagePath: string
}
export interface EnableAgentsMDL {
    userId: number,
    userName: string,
    userPassword: string,
    roleId: number,
    roleName: string,
    alottedBreak: string,
    userNoOfChats: number,
    languageId: number,
    employeeFname: string,
    employeeLname: string,
    employeeEmail: string,
    employeePhone: string,
    companyId: string,
    status: boolean,
    companyName: string,
    apiCode: string,
    countryCode: string
}


export interface EmployeCompanyWebMDL {
    websiteId: number,
    companyId: number,
    autoGreetTime: number,
    websiteTitle: string,
    domainName: string,
    priorityLanguage: number,
    greeting: string,
    closing: string,
    status: boolean,
    timeZone: string,
    adStatus: number,
    industry: string,
    country: string,
    city: string,
    salesPerson: number,
    clientCoordinator: number,
    statusId: number,
    rating: number,
    companyName: string

}

export interface EmployeeWebTree {
    value: Number,
    lable: string,
    websiteid: Number,
    websitetitle: string,
    children?: Array<EmployeeWebTree>,
}


export interface ChatTranscriptData {

    visitorId: number,
    visitorName: string,
    chatId: number,
    userId: number,
    serName: string,
    domainName: string,
    chatStartTime: Date,
    chatEndTime: Date,
    websiteId: number,
    emailStatus: string,
    departmentName: string,
    emailDate: Date,
    qcAgents: string

}


//.....................................ResourcePool  by:Asad Noman

export interface AllResourcesData {
    userId: Number,
    userName: string,
    userPassword: any,
    roleId: Number,
    roleName: string,
    alottedBreak: string,
    userNoOfChats: Number,
    languageId: Number,
    employeeFname: string,
    employeeLname: string,
    employeeEmail: string,
    employeePhone: string,
    companyId: string,
    status: boolean,
    companyName: string
}


export interface UserTrainingInfo {
    userId: Number,
    websiteId: Number,
    trainedId: Number,
    rating: string,
    status: Number
}

export interface WebsiteStatus {
    statusId: number,
    status: string
}
export interface RoleInterface {
    interfaceId: number,
    interfaceName: string
}

export interface companyRoleMDL {
    roleId: number,
    roleName: string,
    empCompanyId: string,
    status: true
}

export interface SaveUserTrainedOn {
    opTrainedId: number,
    websiteId: number,
    userId: number,
    opTrainedRating: string,
    statusId: number,
    languageId: any,
    status: any,
    userDepartments: string,
}


export interface LanguageMDL {
    languageId: number,
    languageName: string,
    shortForm: string
}

export interface employeeCompanyMDL {
    employeeCompanyId: string,
    companyName: string,
    address: string,
    phoneNumber: string,
    contactPerson: string,
    contactEmail: string,
    status: boolean,
    companyTypeId: number,
    fax: string,
    smtpId: number,
    companyColor: string,
    creationDate: Date,
    createdBy: number,
    apiCode: string,
    parentCompany: string,
    allowedAttempts: number,
    passwordExpiryDays: number,
    lockDuration: number,
}