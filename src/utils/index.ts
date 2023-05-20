import moment from 'moment';
import { wglcsApiService } from '../services/WglcsApiService';

class Utils {
    
    isThirdPartyUrl = (message: string): boolean => {

        var regEx = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm
        
        var res = message.match(regEx);

        return res !=null && res.length > 0;
    }

    StripStartAndTrailingSlashes = (str: string) => {
        var startIndex = str.startsWith('/') ? 1 : 0;
        var endsIndex = str.endsWith('/') ? -1 : str.length;

        return str.slice(startIndex, endsIndex);
    }

    EmailForm = async (visitorId: number, chatId, websiteId, userId, timeStamp, empCompId) => {
        let starTime = moment(timeStamp).format("MM/DD/yy H:mm:ss");
        let URLparams = visitorId + "&ChatId=" + chatId + "&WebsiteId=" + websiteId + "&UserId=" + userId + "&ChatStartTime=" + starTime.toString();
        if (empCompId == '01') {
            var RoleInterface = (await wglcsApiService.getroleinterfaces()).data!.data;
            let interfaceResponse = RoleInterface.some(el => el.interfaceName === "Chat Transcripts With QC");
            if (interfaceResponse) {
                let url = `https://email.thelivechatsoftware.com/EmailForm/Emailform.aspx?qa=true&VisitorId=` + URLparams
                window.open(url, 'chatEnd','width=500, height=400')
            } else {
                let url = `https://email.thelivechatsoftware.com/EmailForm/default.aspx?VisitorId=` + URLparams
                window.open(url, 'chatEnd','width=500, height=400')
            }
        } else if (empCompId == "01-1326") {
            let url = `https://email.thelivechatsoftware.com/EmailForm/EmailFormEaglehills.aspx?VisitorId=` + URLparams;
            window.open(url, 'chatEnd','width=500, height=400')
        }
        else {
            let url = `https://email.thelivechatsoftware.com/EmailFormClient/EmailFormClient.aspx?VisitorId=` + URLparams;
            window.open(url, 'chatEnd','width=500, height=400')
        }
    }
}

var utils = new Utils();

export {
    utils
}