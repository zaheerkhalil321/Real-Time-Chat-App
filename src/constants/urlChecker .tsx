import React from "react";
import moment from 'moment';
import { ChatModel } from '../models/index';
const processString = require('react-process-string');

class urlChecker {
    constructor() {

    }

    urlCheck(data: string) {
        let stringWithLinks = data.replace('[NAVIGATEURL]', "");

        let config = [{
            regex: /(http|https):\/\/(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
            fn: (key, result) => <span key={key}>
                <a style={{ color: 'black', textDecoration: 'underline' }} target="_blank" href={`${result[1]}://${result[2]}.${result[3]}${result[4]}`}>{result[2]}.{result[3]}{result[4]}</a>{result[5]}
            </span>
        }, {
            regex: /(\S+)\.([a-z]{2,}?)(.*?)( |\,|$|\.)/gim,
            fn: (key, result) => <span key={key}>
                <a style={{ color: '#009DA0', textDecoration: 'underline' }} target="_blank" href={`http://${result[1]}.${result[2]}${result[3]}`}>{result[1]}.{result[2]}{result[3]}</a>{result[4]}
            </span>
        }];
        var processed = processString(config)(stringWithLinks);
        return processed;

    }


}

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const phoneRegex = /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;

const checkMaskingTypeEmail = (message: String) => {
    if (message) {
        var maskingMessage = message.split('@');
        maskingMessage[0] = '*******';
        var filterMessage = maskingMessage[0] + maskingMessage[1];
        return filterMessage;
    }
    return '';
}

const checkMaskingTypePhone = (message: String) => {
    if (message) {
        var charArray = Array.from(message);
        var msg = message;
        for (let i = 0; i < message.length / 2; i++) {
            msg = msg.replace(charArray[i], '*');
        }
        return msg;
    }
    return '';
}

const getTimeForPreviousChat=(timeStamp)=>{
    var finalTime;

    // if (timeStamp.includes("T")) {
        let localTime = moment.utc(timeStamp, 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD HH:mm:ss');
        localTime = (localTime as any)?.split(' ')[1]?.split(':');
        let daynight = Number(localTime[0]) >= 12 ? 'PM' : 'AM';
        let hoursFormat = Number(localTime[0]) % 12 || 12;
        finalTime = hoursFormat + ':' + localTime[1] + ':' + localTime[2] + ' ' + daynight;
        return finalTime;
    // }
}


const getTime = (timeStamp) => {
    var finalTime;
    if (timeStamp.includes('/')) {

        let signalRDateFormat = timeStamp.substr(0, 19);
        timeStamp = moment.utc(signalRDateFormat).format('YYYY-MM-DD HH:mm:ss');

    }
    let time = (timeStamp as any)?.split(' ')[1]?.split(':');
    if (time != undefined) {
        let localTime = moment.utc(timeStamp, 'YYYY-MM-DD HH:mm:ss').local().format('YYYY-MM-DD HH:mm:ss');
        localTime = (localTime as any)?.split(' ')[1]?.split(':');
        let daynight = Number(localTime[0]) >= 12 ? 'PM' : 'AM';
        let hoursFormat = Number(localTime[0]) % 12 || 12;
        finalTime = hoursFormat + ':' + localTime[1] + ':' + localTime[2] + ' ' + daynight;

        return finalTime;
    }
}

const getUrl = (chat: ChatModel) => {
    var updateLink;
    var currentLink;
    if (chat.visitorInfo?.BT?.websiteurl) {
        currentLink = chat.visitorInfo?.BT.websiteurl;
        if (currentLink?.length > 30) {
            updateLink = currentLink.replace(/^https?\:\/\/?(?:www\.)?/i, "");
            return updateLink.slice(0, 30);

        }
        else {
            updateLink = currentLink.replace(/^https?\:\/\/?(?:www\.)?/i, "");
            return updateLink;
        }
    }
    else if (chat.visitorInfo?.Info?.URL) {
        currentLink = chat.visitorInfo?.Info?.URL;
        if (currentLink.length > 30) {
            updateLink = currentLink.replace(/^https?\:\/\/?(?:www\.)?/i, "");
            return updateLink.slice(0, 30);

        }
        else {
            updateLink = currentLink.replace(/^https?\:\/\/?(?:www\.)?/i, "");
            return updateLink;
        }

    }
    else {

        return '[Website Url Pending]';
    }
}
var URL = new urlChecker();

export { URL, emailRegex, phoneRegex, getTime, checkMaskingTypeEmail, checkMaskingTypePhone, getUrl,getTimeForPreviousChat };
