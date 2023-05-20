import moment from 'moment';
import { IChatService } from './IChatService';
import EventEmitter from './eventemitter';
import { Events } from '../models/events';
import { ChatHubServerProxy, VisitorInitData, PreviewMessage, SignalRChatMessage, MessageModel, ChatMessageModel, ChatModel, AvailableUserForTransfer, OperatorType,QAChat, LoginResponse, IDestroyRoom } from '../models';
import { setTimeout } from 'timers';

class SignalRChatService implements IChatService {

    public chatHub: SignalR.Hub.Proxy = null!;
    public chatHubServer: ChatHubServerProxy = null!;
    userData: LoginResponse = null!;
    private static InterfaceName = 'React Operator Panel';


    connect = async () => {

        this.userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse

        if(this.userData == null) {
            console.info('SignalR Not Connected Yet. Checking in 3 seconds');
            setTimeout(this.connect, 3000);
            return;
        }

        if (this.chatHubServer == null) {
            await this.connectSignalR();
        }
    }

    isConnected() {
        return $.connection.hub && $.connection.hub.state === $.signalR.connectionState.connected;
    }

    connectSignalR = async () => {

        try {

            this.chatHub = ($.connection as any).chatHub;
            this.chatHubServer = (this.chatHub as any).server as ChatHubServerProxy;

            this.chatHub.on('initData', (initData: VisitorInitData) => {
                EventEmitter.emit(Events.onInitData, initData);
            });

            this.chatHub.on('initDataNew', (data) => {
                console.log("initDataNew hit", data);
            });

            this.chatHub.on('initDataNew1', (data) => {
                console.log("initDataNew1 hit", data);
            });

            this.chatHub.on('addMessage', (chatid, message, userType) => {

                EventEmitter.emit(Events.onPreviewMessage, { chatId: chatid, message: message } as PreviewMessage);
            });

            this.chatHub.on('visitorData', (visitorData) => {

                var visitorDataObj = visitorData;

                if (typeof visitorData == "string") {
                    visitorDataObj = JSON.parse(visitorData);
                }
                EventEmitter.emit(Events.onVisitorDataUpdate, visitorDataObj);
            });

            this.chatHub.on('GetInvitation', (data: SignalRChatMessage) => {
                var isGreet = data.IsCustomMessage == "GreetMessage";
                var message: MessageModel = {
                    chatId: data.ChatId,
                    websiteId: data.WebsiteId,
                    visitorId: data.VisitorId,
                    visitorName: data.VisitorName,
                    VisitorJID: '',
                    autoGreetMessage: '',
                    userName: data.VisitorName,
                    chatType: data.ChatType
                };


                EventEmitter.emit(Events.onNewChatReceived, message);
            });

            this.chatHub.on('GetMessage', (data: SignalRChatMessage) => {
                if (data.IsCustomMessage == "[destroy room]") {
                    EventEmitter.emit(Events.OnDestroyRoom, { chatId: data.ChatId, showMailForm: true } as IDestroyRoom);
                    return;
                }

                if (data.IsCustomMessage == "FirstMessage") {
                    this.chatHubServer.relogged(data.ChatId, SignalRChatService.InterfaceName, this.userData.userLoginData.userId);
                }

                if (data.IsCustomMessage != "Data") {

                    console.warn(`Unknown IsCustomMessage Found: ${data.IsCustomMessage}`)

                    // return;
                }

                var msg = this.ToChatMessageModel(data);


                EventEmitter.emit(Events.onChatMessageReceived, msg);
            });

            var promise = new Promise<SignalR.Hub.Connection>((resolve, reject) => {
                $.connection.hub.url = 'https://blue.thelivechatsoftware.com/signalrserver/signalr';
                $.connection.hub.logging = true;
                $.connection.hub.start({
                    transport: ["webSockets", "longPolling"],
                    jsonp: true,
                    xdomain: true,
                    waitForPageLoad: false
                } as any)
                    .done(() => resolve($.connection.hub))
                    .fail(() => reject('Could not connect'));
            });

            await promise;

            $.connection.hub.disconnected(function() {
                setTimeout(function() {
                    $.connection.hub.start();
                }, 1000); // Restart connection after 1 seconds.
             });

            console.log('SignalR connected with connection ID=' + $.connection.hub.id);
            this.chatHub = ($.connection as any).chatHub;
            this.chatHubServer = (this.chatHub as any).server as ChatHubServerProxy;
            await this.chatHubServer.unRegisterWebrtcUser(this?.userData?.userLoginData?.userId);
            await this.chatHubServer.registerUser(this?.userData?.userLoginData?.userId);

        } catch (error) {
            console.log(error);
        }
    }

    sendMessage = (chat: ChatModel, messageBody: string, takenOver: boolean,QAChat:QAChat) => {
        var user_id;
        if (chat.operatorType == OperatorType.QualityControl) {
            user_id = QAChat.userId
        }



        var obj: SignalRChatMessage = {
            ChatId: chat.info.chatId,
            ChatType: chat.info.chatType,
            EndTime: 'false',
            IsCustomMessage: !takenOver ? chat.operatorType == OperatorType.QualityControl ? `${messageBody}\n\r` : 'Data' : messageBody,
            ManagerId: this.userData.userLoginData.userId.toString(),
            MessageBody: messageBody,
            NickName: this.userData.userLoginData.username,
            SoftwareUserId: this.userData.userLoginData.userId.toString(),
            TimeStamp: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            UserId: !takenOver ? chat.operatorType == OperatorType.QualityControl ? '-' + user_id.toString() : this.userData.userLoginData.userId.toString() : user_id.toString(),
            VisitorId: chat.info.visitorId,
            VisitorName: chat.info.visitorName,
            WebsiteId: chat.info.websiteId,
            Sender: null,
            Agent: null,
            Besttimereach: '',
            CellNo: '',
            DomainName: null,
            GreetId: '',
            Lang: null,
            Miscellaneous: null,
            Subject: '',
            TransferUserId: null,
            WebsiteUrl: ''
        };

        this.chatHubServer.sendMessage(obj);
    }

    async assignUsersToWebsiteQc(userId, langId) {
        await this.chatHubServer.assignUsers2WebisteQc(userId, langId);
    }

    async unAssignUsersFromWebsitesQc(userId){
        await this.chatHubServer.unAssignUsersFromWebsitesTextUsQc(userId);
    }

    getId(chat: ChatModel) {
        var user_id;

        var userData = (JSON.parse(localStorage.getItem('hybridChats')!));
        user_id = userData.find(element => {
            if (
                element.chatId == chat.localConversation[0].chatId) return element.userId

        });

        return user_id?.userId;

    }

    transferChat = (chatInfo: MessageModel, targetOperator: AvailableUserForTransfer) => {

        let obj: SignalRChatMessage = {
            ChatId: chatInfo.chatId,
            ChatType: chatInfo.chatType,
            EndTime: "false",
            IsCustomMessage: "Data",
            ManagerId: targetOperator.userId.toString(),
            MessageBody: '',
            NickName: this.userData.userLoginData.username,
            SoftwareUserId: this.userData.userLoginData.userId.toString(),
            TimeStamp: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            UserId: "-"+this.userData.userLoginData.userId.toString(),
            VisitorId: chatInfo.visitorId,
            VisitorName: this.userData.userLoginData.username.toString(),
            WebsiteId: chatInfo.websiteId,
            Sender: null,
            Agent: null,
            Besttimereach: '',
            CellNo: '',
            DomainName: null,
            GreetId: '',
            Lang: null,
            Miscellaneous: null,
            Subject: '',
            TransferUserId: null,
            WebsiteUrl: ''
        };

        this.chatHubServer.transferChat(obj);

        var transferMesg: SignalRChatMessage = {
            ChatId: chatInfo.chatId,
            ChatType: chatInfo.chatType,
            EndTime: "false",
            IsCustomMessage: "[TransferChat]",
            ManagerId: this.userData.userLoginData.userId.toString(),
            MessageBody: `[TRANSFERCHAT]_Transferred By ${this.userData.userLoginData.username.toString()} to ${targetOperator.userName}`,
            NickName: this.userData.userLoginData.username,
            SoftwareUserId: this.userData.userLoginData.userId.toString(),
            TimeStamp: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            UserId: "-"+this.userData.userLoginData.userId.toString(),
            VisitorId: chatInfo.visitorId,
            VisitorName: this.userData.userLoginData.username.toString(),
            WebsiteId: chatInfo.websiteId,
            Sender: null,
            Agent: null,
            Besttimereach: '',
            CellNo: '',
            DomainName: null,
            GreetId: '',
            Lang: null,
            Miscellaneous: null,
            Subject: '',
            TransferUserId: null,
            WebsiteUrl: ''
        };

        this.chatHubServer.sendMessage(transferMesg);
    }

    reAttachExistingRoom = async (item: ChatModel) => {

        var messages: SignalRChatMessage[] = await this.chatHubServer.getAllData(item.info.chatId);
    
        //TODO: @Asad Bhai will look at this code
        if (item.localConversation.length < 1) {
            messages
                .map(m => this.ToChatMessageModel(m))
                .forEach(msg => EventEmitter.emit(Events.onChatMessageReceived, msg));
        }
    }
    disconnect = async () => {
        if (this.chatHubServer == null) {
            return;
        }

        await this.chatHubServer.unRegisterWebrtcUser(this.userData.userLoginData.userId);
    }

    dndChat = (chatType: string, roomId: string, websiteId: string, visitorId: string): void => {


        let obj: SignalRChatMessage = {
            IsCustomMessage: "[DND]",
            EndTime: "true",
            UserId: this.userData.userLoginData.userId.toString(),
            ManagerId: this.userData.userLoginData.userId.toString(),
            ChatType: chatType,
            ChatId: roomId,
            WebsiteId: websiteId,
            NickName: this.userData.userLoginData.username,
            MessageBody: "[DND]",
            VisitorName: this.userData.userLoginData.username,
            TimeStamp: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            VisitorId: visitorId,
            SoftwareUserId: this.userData.userLoginData.userId.toString(),
            Sender: null,
            Agent: null,
            Besttimereach: '',
            CellNo: '',
            DomainName: null,
            GreetId: '',
            Lang: null,
            Miscellaneous: null,
            Subject: '',
            TransferUserId: null,
            WebsiteUrl: ''
        };
        this.chatHubServer.sendMessage(obj);
    }

    blockChat(chatType: string, roomId: string, websiteId: string, visitorId: string,chat_id:string): void {


        let obj: SignalRChatMessage = {
            IsCustomMessage: "[Ignore]",
            EndTime: "true",
            UserId: this.userData.userLoginData.userId.toString(),
            ManagerId: this.userData.userLoginData.userId.toString(),
            ChatType: chatType,
            ChatId: roomId,
            WebsiteId: websiteId,
            NickName: this.userData.userLoginData.username,  
            MessageBody: "[Ignore]",
            VisitorName: this.userData.userLoginData.username,
            TimeStamp: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            VisitorId: visitorId,
            SoftwareUserId: '-'+this.userData.userLoginData.userId.toString(),
            Sender: null,
            Agent: null,
            Besttimereach: '',
            CellNo: '',
            DomainName: null,
            GreetId: '',
            Lang: '1',
            Miscellaneous: null,
            Subject: '',
            TransferUserId: null,
            WebsiteUrl: ''
        };
        this.chatHubServer.sendMessage(obj);
    }

    updateNickName = (chatType: string, chatId: string, websiteId: Number, visitorId: string, visitorName: string) => {

        let obj: SignalRChatMessage = {
            ChatType: chatType,
            EndTime: "false",
            ChatId: chatId,
            IsCustomMessage: "[NICKCHANGE]",
            MessageBody: "[NICKCHANGE]",
            UserId: this.userData.userLoginData.userId.toString(),
            ManagerId: this.userData.userLoginData.userId.toString(),
            TimeStamp: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            WebsiteId: websiteId.toString(),
            VisitorName: visitorName,
            NickName: visitorName,
            VisitorId: visitorId,
            SoftwareUserId: this.userData.userLoginData.userId.toString(),
            Sender: null,
            Agent: null,
            Besttimereach: '',
            CellNo: '',
            DomainName: null,
            GreetId: '',
            Lang: null,
            Miscellaneous: null,
            Subject: '',
            TransferUserId: null,
            WebsiteUrl: ''
        };

        this.chatHubServer.sendMessage(obj);
    }

    attachEvents = async (chatId: string, websiteId: string, visitorId: string) => {

        if(!this.isConnected()) {
            console.info('[attachEvents] SignalR Not Connected Yet. Checking in 3 seconds');
            setTimeout(() => this.attachEvents(chatId, websiteId, visitorId), 3000);
        }

        await this.chatHubServer.emit(websiteId + ":" + visitorId + ":" + chatId + ":" + this.userData.userLoginData.userId);
        await this.chatHubServer.relogged(chatId, SignalRChatService.InterfaceName, this.userData.userLoginData.username);
        await this.chatHubServer.updateGreeterStatus(chatId);
        //await this.chatHubServer.visitorData();
    }

    private ToChatMessageModel(data: SignalRChatMessage): ChatMessageModel {

        return new ChatMessageModel(
            data.ChatId,
            data.UserId,
            data.VisitorName,
            data.MessageBody,
            data.TimeStamp,
            data.ChatId,   // TODO. Fix this,
            data.ChatType,
            data.ManagerId,
            data.NickName);
    }
}

var signalRChatService = new SignalRChatService();
export { signalRChatService };
