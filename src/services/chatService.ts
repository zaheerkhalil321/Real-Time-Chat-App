import { AvailableUserForTransfer, MessageModel, OpenFireChatType } from '../models';
import { signalRChatService } from './SignalRChatService';
import { xmppChatService } from './XmppChatService';
import { ChatModel } from '../models/index';
import "moment-timezone";
import { IChatService } from './IChatService';

class ChatService {

    // Used because ChatComponent keeps calling this on Load.
    // ChatService should only do it once. and all the subsequent connections will be established automatically reconnection
    private connected: boolean = false;

    services: Map<string, IChatService> = new Map<string, IChatService>([
        [OpenFireChatType, xmppChatService],
        ['Chat', xmppChatService],
        ['web2.0', signalRChatService],
        ['TextUs', signalRChatService],
        ['facebook', signalRChatService],
        ['RTC', signalRChatService]
    ]);

    async connect() {
        if (this.connected == false) {
            await signalRChatService.connect();
            await xmppChatService.connect();
            this.connected = true;
        }
    }

    sendMessage = (chat: ChatModel, messageBody: string, takenOver: boolean,QAChat) => {
        this.services.get(chat.info.chatType)!.sendMessage(chat, messageBody, takenOver,QAChat);
    }

    reAttachExistingRoom = async (chat: ChatModel) => {
        this.checkChatType(chat.info.chatType);
        await this.services.get(chat.info.chatType)!.reAttachExistingRoom(chat);
        await signalRChatService.attachEvents(chat.info.chatId, chat.info.websiteId, chat.info.visitorId);
    }

    dndChat = async (chatType: string, roomId: string, websiteId: string, visitorId: string) => {
        this.checkChatType(chatType);
        this.services.get(chatType)!.dndChat(chatType, roomId, websiteId, visitorId);
    }

    blockChat = async (chatType: string, roomId: string, websiteId: string, visitorId: string, chatId: string) => {
        this.checkChatType(chatType);
        this.services.get(chatType)!.blockChat(chatType, roomId, websiteId, visitorId, chatId);
    }

    transferChatOperator = async (chatInfo: MessageModel, targetOperator: AvailableUserForTransfer) => {
        this.checkChatType(chatInfo.chatType);
        this.services.get(chatInfo.chatType)!.transferChat(chatInfo, targetOperator);
    }

    updateNickName(chatInfo: MessageModel, newName: string) {
        this.checkChatType(chatInfo.chatType);
        this.services.get(chatInfo.chatType)!.updateNickName(chatInfo.chatType, chatInfo.chatId, parseInt(chatInfo.websiteId), chatInfo.visitorId, newName);
    }

    async disconnect() {
        await signalRChatService.disconnect();
        xmppChatService.disconnect();
    }

    checkChatType(chatType: string) {
        if (!this.services.has(chatType)) {
            console.error(`Unknown Chat Type: '${chatType}'`);
        }
    }
}


var chatService = new ChatService();
export { chatService };