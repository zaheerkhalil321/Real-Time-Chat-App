import { ChatMessageModel, ChatModel, MessageModel, OpenFireChatType, OperatorType, QAChat, LoginResponse } from '../models';
import { IChatService } from './IChatService';
import EventEmitter from './eventemitter';
import { Events } from '../models/events';
import moment from 'moment';
import { signalRChatService } from './SignalRChatService';
import { AvailableUserForTransfer, UserData, IDestroyRoom } from '../models/index';
import { Strophe, $pres } from 'strophe.js';

class XmppChatService implements IChatService {

    public stropheConnection: Strophe.Connection = null!;

    connect = async () => {

        var userData = this.GetUserLoginData();

        if(userData == null) {
            console.info('Strophe Not Connected Yet. Checking in 3 seconds');
            setTimeout(this.connect, 3000);
            return;
        }

        if(this.isStropheDisconnecting()) {
            setTimeout(this.connect, 3000);   
            return;
        }
        
        if (this.isStropheDisconnected()) {
            this.stropheConnection = await this.connectStrophe();

            this.attachEvents();
        }
    }

    private GetUserLoginData() : UserData | null {
        var userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse;

        if(userData == null) {
            return null;
        }

        return userData.userLoginData;
    }

    isStropheDisconnected = () => {
        return this.stropheConnection == null || (this.stropheConnection as any)?.connected == false;
    }

    isStropheDisconnecting = () => {
        return (this.stropheConnection as any)?.disconnecting;
    }

    connectStrophe = (): Promise<Strophe.Connection> => {

        return new Promise<Strophe.Connection>((resolve: (connection: Strophe.Connection) => void, reject: (reason?: any) => void) => {
            var xmppconnection = new Strophe.Connection('https://thechatsoftware.com/http-bind/', { 'mechanisms': [Strophe.SASLPlain] } as any);

            var userData = this.GetUserLoginData();
            xmppconnection.connect(userData!.userId + "@localhost/LiveAdminsChat", userData!.userPassword, (status: Strophe.Status, reason: string) => {

                if (status == Strophe.Status.CONNECTING) {
                    EventEmitter.emit(Events.stropheStatus,2)
                    console.log("Strophe Status: CONNECTING");
                } else if (status == Strophe.Status.AUTHENTICATING) {
                    console.log("Strophe Status: AUTHENTICATING");
                } else if (status === Strophe.Status.CONNECTED) {
                    console.log('Strophe Status: Connected.');
                    resolve(xmppconnection);
                    EventEmitter.emit(Events.stropheStatus,1)
                } else if (status == Strophe.Status.CONNFAIL) {
                    // reject(condition);
                } else if (status == Strophe.Status.DISCONNECTING) {
                    console.log("Strophe Status: Disconnecting");
                } else if (status === Strophe.Status.DISCONNECTED) {
                    console.log(`Strophe Status: Disconnected. Reason: ${reason}`);

                    if (reason == "conflict") {
                        EventEmitter.emit(Events.onOperatorLogOut, 'xmpp conflict');
                    } else {
                        setTimeout(() => {
                            this.connect();
                            EventEmitter.emit(Events.ReAttachExistingRooms, null);    
                        }, 3000);
                    }

                    // TODO
                    // reject(condition);
                }
                else if (status == Strophe.Status.AUTHFAIL) {
                    console.log(`AUTHFAIL with error: ${reason}`);
                    // reject(condition);
                }
                else if (status == Strophe.Status.ERROR) {
                    console.log(`ERROR with error: ${reason}`);
                    // reject(condition);
                }
            }, undefined, undefined, "xmpp:localhost:5225");
        });
    }

    onMessageEvent = (msg) => {


        if (this.isDestroyRoom(msg)) {
            // No Need to do anything here.
        } else {
            var val = this.extractMessageFromInvite(msg);
            if (val != null) {
                // SignalR Events are same for OpenFire Too
                signalRChatService.attachEvents(val.chatId, val.websiteId, val.visitorId);
                EventEmitter.emit(Events.onNewChatReceived, val);
            }
        }
        return true;
    }

    onGroupChatMessageEvent = (msg) => {

        if (this.isDestroyRoom(msg)) {
            // No Need to do anything here.
        } else {
            var obj = this.extractMessageFromGroupChat(msg)

            EventEmitter.emit(Events.onChatMessageReceived, obj);
        }

        return true;
    }

    attachEvents = () => {

        if(this.isStropheDisconnecting() || this.isStropheDisconnected()) {
            setTimeout(this.attachEvents, 3000);   
        }
        
        this.stropheConnection.send($pres());

        (this.stropheConnection as any).addHandler((msg) => { return true; }, 'jabber:x:conference');
        (this.stropheConnection as any).addHandler(this.onMessageEvent, null, 'message', null, null, null);
        (this.stropheConnection as any).addHandler(this.onGroupChatMessageEvent, null, 'message', "groupchat");
    }

    removeEvents = () => {
    }

    isDestroyRoom(msg: Element): boolean {
      
        let bodyMessage = Strophe.getText(msg.getElementsByTagName('body')[0]);

        if (bodyMessage == "[destroy room]") {
            let chatId = msg.getAttribute('chat_id');

            EventEmitter.emit(Events.OnDestroyRoom, { chatId: chatId, showMailForm: true } as IDestroyRoom);

            return true;
        }

        return false;
    }


    extractMessageFromInvite = (msg: Element): MessageModel | null => {

        var from = msg.getAttribute('from');
        var invite = msg.getElementsByTagName('invite');
        var reason = msg.getElementsByTagName('reason');
        var userData = this.GetUserLoginData()!;

        if (invite[0]) {
            this.reAttachExistingRoom({ roomId: from } as ChatModel);
            return this.extractMessage(reason[0].innerHTML);
        } else if(from?.endsWith(userData.username)) {
            var a =3;
        } else {
            console.log(`Unknown Stanza Found: ${msg?.textContent} `, msg);
        }

        return null;
    }

    extractMessageFromGroupChat = (msg: Element): ChatMessageModel => {

        var from = msg.getAttribute('from') ?? '';
        var userId = msg.getAttribute('user_id') ?? '';
        var manager_id = msg.getAttribute('manager_id') ?? '';
        var visitorName = msg.getAttribute('visitor_name') ?? '';
        let timeStamp = msg.getAttribute('time_stamp') ?? '';

        var elems = msg.getElementsByTagName('body');
        let message = Strophe.getText(elems[0]);

        // Optional Parameters
        // var to = msg.getAttribute('to');
        // var websiteId = msg.getAttribute('website_id');
        // var endTime = msg.getAttribute('end_time');
        // var invite = msg.getElementsByTagName('invite');
        // let chatId = msg.getAttribute('chat_id');

        from = this.getRoom(msg.getAttribute('from')) ?? '';

        return new ChatMessageModel(
            from.substring(from.lastIndexOf("m") + 1, from.lastIndexOf("@")),
            userId,
            visitorName,
            message,
            timeStamp,
            from,
            'Strophe',
            manager_id,
            visitorName);
    }

    getRoom = (room) => {
        var roomId = room;
        var n = roomId.indexOf("/");
        if (n == -1) {
            return roomId
        } else {
            var room = roomId.substring(0, n);
            return room
        }
    }

    sendMessage = (chat: ChatModel, messageBody: string, takenOver: boolean,QAChat:QAChat) => {
        var user_id;
        if (chat.operatorType == OperatorType.QualityControl) {
            user_id = QAChat.userId
        }

        var roomId = chat.roomId;
        var username = chat.info.visitorName;
        var website_id = chat.info.websiteId;
        var chatId = chat.info.chatId;

  
        var userData = this.GetUserLoginData()!;

        var o = {
            to: roomId,
            type: 'groupchat',
            chat_id: chatId,
            custom_packet: true,
            user_id: !takenOver ? chat.operatorType == OperatorType.QualityControl ? '-' + user_id : userData.userId : user_id,
            manager_id: userData.userId,
            time_stamp: moment.utc().format('YYYY-MM-DD HH:mm:ss'),
            website_id: website_id,
            visitor_name: !takenOver ? chat.operatorType == OperatorType.QualityControl ? 'QC' : userData.username : userData.username,
        };

        var m = $msg(o); m.c('body', null, messageBody);
        this.stropheConnection.send(m.tree());
    }
  

    private extractMessage = (invite): MessageModel => {

        let str = invite
        let oneIndex = str.indexOf("|");
        let chatId = str.substring(0, oneIndex);

        str = str.substring(oneIndex + 1, str.length);
        oneIndex = str.indexOf("|");
        let websiteId = str.substring(0, oneIndex);

        str = str.substring(oneIndex + 1, str.length);
        oneIndex = str.indexOf("|");
        let visitorId = str.substring(0, oneIndex);

        str = str.substring(oneIndex + 1, str.length);
        oneIndex = str.indexOf("|");
        let visitorName = str.substring(0, oneIndex);

        str = str.substring(oneIndex + 1, str.length);
        oneIndex = str.indexOf("|");
        let VisitorJID = str.substring(0, oneIndex);

        str = str.substring(oneIndex + 1, str.length);
        oneIndex = str.indexOf("|");
        let autoGreetMessage = str.substring(0, oneIndex);

        let userName = str.substring(oneIndex + 1, str.length);

        return {
            chatId: chatId,
            websiteId: websiteId,
            visitorId: visitorId,
            visitorName: visitorName,
            VisitorJID: VisitorJID,
            autoGreetMessage: autoGreetMessage,
            userName: userName,
            chatType: OpenFireChatType
        };
    }

    transferChat = async (chatInfo: MessageModel, targetOperator: AvailableUserForTransfer) => {

        var reason_packet = chatInfo.chatId + "|" + chatInfo.websiteId + "|" + chatInfo.visitorId + "|"
            + chatInfo.visitorName + "|" + chatInfo.VisitorJID + "|"
            + chatInfo.autoGreetMessage + "|" + chatInfo.userName;

        await this.stropheConnection.send($msg({
            to: "room" + chatInfo.chatId + "@conference.localhost"
        }).c("x", {
            xmlns: "http://jabber.org/protocol/muc#user",
        }).c("invite", {
            to: targetOperator.userId + "@localhost/LiveAdminsChat"
        }).c("reason").t(reason_packet.toString()));

        var userData = this.GetUserLoginData()!;

        var o = {
            to: "room" + chatInfo.chatId + "@conference.localhost",
            type: 'groupchat',
            chat_id: chatInfo.chatId,
            custom_packet: true,
            user_id: '-' + userData.userId,
            manager_id: userData.userId,
            time_stamp: '2020-10-12 15:10:59',
            website_id: chatInfo.websiteId,
            visitor_name: userData.username
        };

        var m = $msg(o); m.c('body', null, '[TRANSFERCHAT]_Transferred By ' + userData.username + ' to ' + targetOperator.userName);

        await this.stropheConnection.send(m.tree());

        await this.stropheConnection.send($msg({
            to: "room" + chatInfo.chatId + "@conference.localhost/LiveAdminsChat",
            chat_id: chatInfo.chatId,
            custom_packet: !1,
            user_id: userData.userId,
            manager_id: userData.userId,
            time_stamp: "",
            visitor_name: "System",
            website_id: chatInfo.websiteId,
            type: "chat"
        }).c("gone", {
            xmlns: "http://jabber.org/protocol/chatstates"
        }));


        var obj = {
            to: "room" + chatInfo.chatId + "@conference.localhost/LiveAdminsChat",
            type: "unavailable",
            from: userData.userId + '@localhost/LiveAdminsChat'
        };
        var tdata = $pres(obj);
        (tdata as any).c('x', { xmlns: 'http://jabber.org/protocol/muc#user' }, null);
        await this.stropheConnection.send(tdata.tree());

        // TODO.
        //[TRANSFERCHAT]_Transferred By Faryal to Farooq (English (en)) (LA)
        //Gone Packet
    }

    reAttachExistingRoom = (item: ChatModel) => {

        var userData = this.GetUserLoginData()!;

        var o = { to: item.roomId + "/" + userData.username };
        var m: Strophe.Builder = $pres(o);
     
        m.c('x', { xmlns: "muc#roomconfig_changesubject" }, null!);//'http://jabber.org/protocol/muc#user'

        this.stropheConnection.send(m.tree());
    }

    disconnect = () => {
        if (this.isStropheDisconnected()) {
            console.warn('Strophe Connection already disconnected. Cannot disconnect');
            return;
        }

        var userData = this.GetUserLoginData()!;

        var obj = {
            type: "unavailable",
            from: userData.userId + '@localhost/LiveAdminsChat'
        };

        var tdata = $pres(obj);
        (tdata as any).c('x', { xmlns: 'http://jabber.org/protocol/muc#user' }, null);
        this.stropheConnection.send(tdata.tree());
        this.stropheConnection.flush();
        this.stropheConnection.disconnect('custom reason');
    }

    dndChat = async (chatType: string, roomId: string, websiteId: string, visitorId: string) => {

        // TODO. Fix async arrow assignment 
        var o = {
            to: roomId,
            type: 'groupchat',
            end_time: true,

        };
        var m = $msg(o);
        m.c('body', null, '[DND]');
        await this.stropheConnection.send(m.tree());
    }

    blockChat = async (chatType: string, roomId: string, websiteId: string, visitorId: string,chat_id:string) => {

        // TODO. Fix async arrow assignment 
        var userData = this.GetUserLoginData()!;
        var o = {
            to: roomId,
            chatId:chat_id,
            visitorId:visitorId,
            user_id:'-' + userData.userId,
            manager_id:userData.userId,
            type: 'groupchat',
            end_time: true,
            custom_packet: true
        };

        var m = $msg(o);
        m.c('body', null, '[Ignore]');
        await this.stropheConnection.send(m.tree());
    }

    updateNickName(chatType: string, chatId: string, websiteId: Number, visitorId: string, visitorName: string) {

        var userData = this.GetUserLoginData()!;

        // TODO. Fix async arrow assignment 
        var o = {
            to: "room" + chatId + "@conference.localhost",
            type: 'groupchat',
            chat_id: chatId,
            custom_packet: true,
            user_id: userData.userId.toString(),
            manager_id: userData.userId.toString(),
            time_stamp: '2020-10-12 15:10:59',
            website_id: websiteId,
            visitor_name: visitorName
        };
        var m = $msg(o); m.c('body', null, '[NICKCHANGE]');

        this.stropheConnection.send(m.tree());
    }
}


var xmppChatService = new XmppChatService();
export { xmppChatService };
