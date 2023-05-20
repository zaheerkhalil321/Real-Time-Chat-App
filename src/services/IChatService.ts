import { AvailableUserForTransfer, ChatModel, MessageModel, UserData,QAChat } from '../models/index';

export interface IChatService {

    connect(userLoginData: UserData);

    sendMessage(chat: ChatModel, messageBody: string,takenOver:boolean,QAChat:QAChat);

    transferChat(chatInfo: MessageModel, targetOperator: AvailableUserForTransfer);

    reAttachExistingRoom(item: ChatModel);

    disconnect(): void;

    dndChat(chatType: string, roomId: string, websiteId: string, visitorId: string): void;

    blockChat(chatType: string, roomId: string, websiteId: string, visitorId: string, chatId:string): void;

    updateNickName(chatType: string, chatId: string, websiteId: Number, visitorId: string, visitorName: string);
    
}