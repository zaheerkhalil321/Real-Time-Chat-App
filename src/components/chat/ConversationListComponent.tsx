
import React, { useEffect } from "react";
import { VisitorConversation, OperatorType, ChatModel } from '../../models/index';
import { URL, getTime, getTimeForPreviousChat } from '../../constants/urlChecker ';
import moment from 'moment';
import { wglcsApiService } from "../../services/WglcsApiService";
import { LoginResponse, VisitorChatHistory, VisitorInitData, VisitorIpInformation } from "../../models";

interface ConversationListComponentProps {
    conversation: ChatModel,
    operatorType: OperatorType
}


const getClassName = (managerId: number, userId: number, operatorType: OperatorType, message: string) => {

    if (managerId == 0 && userId == 0) {
        return "received_withd_msg";
    }
    else if (message.includes('[TRANSFERCHAT]')) {
        return "sent_msg_OPColor";

    }
    else if (managerId > 0 && userId > 0 && (managerId != 4886 && managerId == userId)) {
        return "sent_msg";

    }
    else if (managerId == 4886) {
        return "sent_msg_system";
    }
    else if (managerId > 0 && userId > 0 && (managerId != userId)) {
        return "sent_msg_changeColor";
    }
    else if (operatorType == OperatorType.Operator && managerId > 0 && userId < 0 && ((managerId != (-1 * userId))) || (managerId == (-1 * userId))) {
        return "sent_msg_OPColor"
    }
    else if (operatorType == OperatorType.QualityControl && managerId > 0 && userId < 0 && (managerId != (-1 * userId))) {
        return "sent_msg_OPColorRed";
    }
    else if (managerId > 0 && userId < 0 && (managerId == (-1 * userId))) {
        return "received_withd_msg";
    }
    else {
        return "sent_msg";
    }
}

const ConversationListComponent = (props: ConversationListComponentProps) => {

    var { conversation, operatorType } = props;
    var expression = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/gi;
    const [tempPreviousChat, setTempPreviousChat] = React.useState([] as any)
    const [previousChat, setPreviousChat] = React.useState([] as any)
    const [isShowpreviousChat, setIsShowpreviousChat] = React.useState(false)

    useEffect(() => {
        if (operatorType == OperatorType.Operator) {
            getPreviousChats()
        }
    }, [conversation.visitorInformation?.visitorId])

    const getPreviousChats = async () => {
        if (conversation.visitorInformation?.visitorId > 0) {
            var chatHistoryByVisitor = await wglcsApiService.getchathistorybyvisitor(conversation.visitorInformation?.visitorId);
            var visitorChatHistory = chatHistoryByVisitor?.data?.data;
            if (visitorChatHistory.length > 0) {
                setTempPreviousChat(visitorChatHistory?.[0].conversation || [])
                if (visitorChatHistory[0].conversation.length > 0) {
                    setIsShowpreviousChat(true)
                }
            }      
        }
    }

    const ShowpreviousChat = () => {
        setPreviousChat(tempPreviousChat)
        setIsShowpreviousChat(false)
    }

    return (
        <>
            {isShowpreviousChat ? <span onClick={ShowpreviousChat} className="visitor_name" style={{ position: "fixed",fontSize:"x-small", backgroundColor: "yellow", width: "91%", cursor: "Pointer", fontStyle: "italic", paddingLeft: "10px" }}> Load Previous chat</span> : ""}
            <br />
            {previousChat?.map((data, i) => {
                var matches = data.messageText.match(expression);
                if (data.messageText != '[NICKCHANGE]' && data.messageText != '[LockChat]' && data.messageText != '[UnLockChat]' && data.messageText != '[destroy room]') {

                    return (
                        <div style={{ backgroundColor: "#c4faf8" }} className={getClassName(parseInt(data.managerId?.toString() ?? "0"), parseInt(data.userId?.toString() ?? "0"), operatorType, data.messageText)} key={i}>
                            <div>
                                {data.userId == 0 ? (<span className="visitor_name">Visitor</span>) : (<span className="visitor_name">{`${data.userName}`}</span>)}
                                <span className="time_date">{` at ${getTimeForPreviousChat(data.timeStamp)}`}</span>
                                {matches ? <p style={{color:'red'}}>{URL.urlCheck(data.messageText)}</p> : <p>{data.messageText}</p>}
                            </div>
                        </div>
                       // {`${conversation.visitorInformation?.visitorName}`}
                    )
                }
            })}


            {conversation.localConversation.map((data, i) => {
                var matches = data.messageText.match(expression);

                if (data.messageText != '[NICKCHANGE]' && data.messageText != '[LockChat]' && data.messageText != '[UnLockChat]') {
                    return (
                        <div className={getClassName(parseInt(data.managerId?.toString() ?? "0"), parseInt(data.userId?.toString() ?? "0"), operatorType, data.messageText)} key={i}>
                            <div>
                                <span className="visitor_name">{`${data.userName}`}</span>
                                <span className="time_date">{` at ${getTime(data.timeStamp)}`}</span>
                                {matches ? <p style={{color:'red'}}>{URL.urlCheck(data.messageText)}</p> : <p>{data.messageText}</p>}
                            </div>
                        </div>
                    )
                }
            })}
        </>
    );
};
export default ConversationListComponent;
