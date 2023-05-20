import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import EventEmitter from "./eventemitter";
import { Events } from "../models/events";

import {
  EnableAgentsMDL,
  companyRoleMDL,
  employeeCompanyMDL,
  LanguageMDL,
  RoleInterface,
  WebsiteStatus,
  UserTrainingInfo,
  AllResourcesData,
  ChatTranscriptData,
  EmployeCompanyWebMDL,
  AgentsMDL,
  WebsitePushPages,
  WebsiteCannedMessages,
  VisitorInformationModel,
  VisitorIpInformation,
  VisitorChatHistory,
  LoginResponseModel,
  ApiResult,
  AvailableUserForTransfer,
  OperatorBreakModel,
  PersonalCannedMessages,
  OperatorChat,
  UserInfo,
  QAChat,
  PersonalCannedMessages1,
  PushContentMDL,
  UnSentChatMDL,
  CannedMessageWithExpiry,
  AllBlockedIps,
  WebsiteBlockKeywords,
} from "../models/index";

import { cacheService } from "./cacheService";
import { userService } from "./userService";
import { utils } from "../utils";

class WglcsApiService {
  instance: AxiosInstance;

  private baseUrl: string = "https://dev1.thelivechatsoftware.com";
  private baseApiUrl: string = `${this.baseUrl}/ChatAppApi/api`;

  constructor() {
    this.instance = axios.create({
      baseURL: this.baseApiUrl,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        accept: "application/json",
      },
      timeout: 200000,
    } as AxiosRequestConfig);

    var userData = userService.GetUserData();
    if (userData != null) {
      this.setAuth(userData.accessToken.auth_token);
    }

    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error?.response?.status === 401) {
          EventEmitter.emit(Events.onOperatorLogOut, "Wglcs 401");
        }
        return error;
      }
    );
  }

  setAuth = (userAuth) => {
    this.instance.defaults.headers.common["Authorization"] =
      "Bearer " + userAuth;
  };

  signIn = (user) =>
    this.instance.post<LoginResponseModel>(
      "wglcs/userinfo_checkandlogin",
      user
    );
  logoff = (user) => this.instance.post("auth/logoff", user);

  getvisitoripinformation = (
    visitorId
  ): Promise<AxiosResponse<ApiResult<VisitorIpInformation[]>>> =>
    cacheService.get(`getvisitoripinformation_${visitorId}`, () =>
      this.instance.get("wglcs/getvisitoripinformation?visitorId=" + visitorId)
    );

  getvisitorinformationbychatid = (
    chatid
  ): Promise<AxiosResponse<ApiResult<VisitorInformationModel>>> =>
    this.instance.get("wglcs/getvisitorinformationbychatid?chatId=" + chatid);

  getcannedmessagesbywebsite = (
    WebSiteId,
    lenguge
  ): Promise<AxiosResponse<ApiResult<WebsiteCannedMessages[]>>> =>
    cacheService.get(`getcannedmessagesbywebsite_${WebSiteId}`, () =>
      this.instance.get(
        "wglcs/getcannedmessagestablebywebsite_new?WebSiteId=" +
          WebSiteId +
          "&LanguageID=" +
          lenguge
      )
    );

  getpercannedmessagesbyuserid = (
    userId,
    languageId
  ): Promise<AxiosResponse<ApiResult<PersonalCannedMessages[]>>> =>
    cacheService.get(`getpercannedmessagesbyuserid_${userId}`, () =>
      this.instance.get(
        `wglcs/getpercannedmessagesbyuserid_new?userId=${userId}&languageId=${languageId}`
      )
    );

  getpercannedmessagesbyuserid_new = (
    userId,
    languageId
  ): Promise<AxiosResponse<ApiResult<PersonalCannedMessages1[]>>> =>
    this.instance.get(
      `wglcs/getpercannedmessagesbyuserid_new?userId=${userId}&languageId=${languageId}`
    );

  getpushpagesbywebsiteid1 = (
    websiteId
  ): Promise<AxiosResponse<ApiResult<PushContentMDL[]>>> =>
    cacheService.get(`getpushpagesbywebsiteid1_${websiteId}`, () =>
      this.instance.get(`wglcs/getpushpagesbywebsiteid?websiteId=${websiteId}`)
    );

  getcannedmessagestablebywebsite_withexpiry = (
    WebSiteId,
    languageId
  ): Promise<AxiosResponse<ApiResult<CannedMessageWithExpiry[]>>> =>
    this.instance.get(
      `wglcs/getcannedmessagestablebywebsite_withexpiry?WebSiteId=${WebSiteId}&languageId=${languageId}`
    );

  siteAndChatListForOpTreeApi = (userId) =>
    this.instance.get("wglcs/websiteandchatlistforoptree?userId=" + userId);

  updateoperatorwindowstate = async (
    userLog: Number,
    isActive: boolean
  ): Promise<any> => {
    if (this.instance.defaults.headers.common["Authorization"] == undefined) {
      return Promise.resolve();
    }

    return await this.instance.post("wglcs/updateoperatorwindowstate", {
      logId: userLog,
      isActiveOperatorWindow: isActive,
    });
  };

  updateqcwindowstate = (userLog: Number, isActive: boolean): Promise<any> =>
    this.instance.post("wglcs/updateoperatorwindowstate", {
      logId: userLog,
      status: isActive,
    });

  updateoperatortimestamp = (data) => {
    return this.instance.post("/wglcs/updateoperatortimestamp", data);
  };

  updatevisitorchatstatus = (status) =>
    this.instance.post("/wglcs/updatevisitorchatstatus", status);
  forgotPassword = (status) =>
    this.instance.post("/wglcs/forgetpassword", status);
  updateUserPassword = (password) =>
    this.instance.post("/wglcs/updateuserpassword/", password);

  getChatLimitByUser = (obj) =>
    this.instance.post("/wglcs/getchatlimit_byuser", obj);
  savecannedmessages_expirydate_ticketno = (data) =>
    this.instance.post("wglcs/savecannedmessages_expirydate_ticketno", data);

  savepersonalcannedmessagesnew = (data) =>
    this.instance.post("wglcs/savepersonalcannedmessagesnew", data);
  getcountofnotsentchatsofuserschatids = (
    employeeId,
    minutes
  ): Promise<AxiosResponse<ApiResult<UnSentChatMDL>>> =>
    this.instance.get(
      "wglcs/getcountofnotsentchatsofuserschatids?employeeId=" +
        employeeId.toString() +
        "&minutes=" +
        minutes
    );
  getoutstandinggreetsbyuser = (
    userId
  ): Promise<AxiosResponse<ApiResult<Number>>> =>
    this.instance.get(
      "wglcs/getoutstandinggreetsbyuser?userId=" + userId + "&timeDiff=4"
    );

  // updateUserChatCount = (obj) => this.instance.post('/wglcs/updateuserchatcount', obj);

  getchathistorybyvisitor = (
    visitorId
  ): Promise<AxiosResponse<ApiResult<VisitorChatHistory[]>>> =>
    this.instance.get(
      "wglcs/GetChatHistoryByVisitorUpdated?visitorId=" + visitorId
    );

  insertbreakinformation = (
    logId: Number
  ): Promise<AxiosResponse<ApiResult<OperatorBreakModel>>> =>
    this.instance.post("/wglcs/insertbreakinformation", {
      breakId: 1,
      breakStartTime: "2020-11-09T11:06:23.415Z",
      breakEndTime: "2020-11-09T11:06:23.415Z",
      logId: logId,
      breakTypeId: 1,
      breakRequest: true,
      breakApproved: true,
      approvedBy: "string",
      breakApplyTime: "2020-11-09T11:06:23.415Z",
    });

  getIsLogIDAlive = (
    logId: Number
  ): Promise<AxiosResponse<ApiResult<boolean>>> =>
    this.instance.get(`wglcs/getIsLogIDAlive?logId=${logId}`);

  updatechatrunningstatus = (chatId: number) =>
    this.instance.post("wglcs/updatechatrunningstatus", {
      chatId: chatId,
      runningStatus: true,
    });
  updatebreakstarttime = (data) =>
    this.instance.post("/wglcs/updatebreakstarttime", data);
  websiteblockkeywords_selectbyuser = (
    userID
  ): Promise<AxiosResponse<ApiResult<WebsiteBlockKeywords[]>>> =>
    this.instance.get(
      "wglcs/websiteblockkeywords_selectbyuser?userId=" + userID
    );

  updatebreakendtime = (data) =>
    this.instance.post("/wglcs/updatebreakendtime", data);

  getpushpagesbywebsiteid = (
    websiteId
  ): Promise<AxiosResponse<ApiResult<WebsitePushPages[]>>> =>
    cacheService.get(`getpushpagesbywebsiteid${websiteId}`, () =>
      this.instance.get("wglcs/getpushpagesbywebsiteid?websiteId=" + websiteId)
    );

  inserpushpagesall = (data) =>
    this.instance.post("/wglcs/inserpushpagesall", data);

  getallblockedips = (): Promise<AxiosResponse<ApiResult<AllBlockedIps[]>>> =>
    this.instance.get("wglcs/getallblockedips");

  saveBlockedIps = (data) => this.instance.post("/wglcs/saveblockedips", data);

  getAvailableOperators = (
    websiteId,
    userId
  ): Promise<AxiosResponse<ApiResult<AvailableUserForTransfer[]>>> =>
    this.instance.get(
      "wglcs/GetAvailableUserForTransfer?websiteId=" +
        websiteId +
        "&userId=" +
        userId
    );

  transferChatToOtherOperator = (operatorId: number, chatId: number) =>
    this.instance.post("wglcs/updateuseridforchat", {
      userId: operatorId,
      chatId: chatId,
    });

  updateUserChatCount = (userId: number, currentChats: number) =>
    this.instance.post("wglcs/updateuserchatcount", {
      userId: userId,
      currentChats: currentChats,
    });

  updateVisitorInfo = (obj) =>
    this.instance.post("wglcs/updatevisitorinfo", obj);

  getrefreshapiwebsiteid = (websiteId) =>
    this.instance.get("wglcs/getpushpagesbywebsiteid?websiteId=" + websiteId);

  WebSiteAndChatListForOpTreeApi = (
    userId: Number
  ): Promise<AxiosResponse<ApiResult<OperatorChat[]>>> =>
    this.instance.get("wglcs/websiteandchatlistforoptree?userId=" + userId);

  getChatsForHybridUser = (
    userId: Number
  ): Promise<AxiosResponse<ApiResult<OperatorChat[]>>> =>
    this.instance.get("/wglcs/getchatsforuser?userId=" + userId);

  getUserInfo = (userId: Number): Promise<AxiosResponse<ApiResult<UserInfo>>> =>
    this.instance.get("/emailform/getuserinfo_userid?userId=" + userId);

  getChatsForQaScreen = (
    userId: Number
  ): Promise<AxiosResponse<ApiResult<QAChat[]>>> =>
    this.instance.get(
      `/wglcs/getchatsforqascreen?userId=${userId}&ChatId=0&Stre=23423`
    );

  getChatsForQaScreenV1 = (
    userId: Number
  ): Promise<AxiosResponse<ApiResult<QAChat[]>>> =>
    this.instance.get(
      `/wglcs/getchatsforqascreenV1?userId=${userId}&ChatId=0&Stre=23423`
    );

  resetForgotPassword = (obj) =>
    this.instance.post("wglcs/resetforgotpassword", obj);

  userSignUp = (name: string, email: string, password: string) => {
    let obj = {
      firstName: name,
      lastName: name,
      email: email,
      password: password,
      confirmPassword: password,
      facebookId: null,
      pictureUrl: null,
    };
    return fetch(`${this.baseApiUrl}/auth/authenticate`, {
      method: "POST",
      headers: new Headers({
        "access-token": "pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S",
        "callback-url": "http://localhost:3000/",
        "Content-Type": "application/json",
      }),
      body: JSON.stringify(obj),
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  insertbreakinformationSecond = (auth_token, userLog) => {
    fetch(`${this.baseApiUrl}/wglcs/insertbreakinformation`, {
      method: "POST",
      headers: new Headers({
        "access-token": "pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S",
        Authorization: "Bearer " + auth_token,
        "Content-Type": "application/json-patch+json",
        accept: "text/plain",
        "api-version": "v1",
      }),

      body: JSON.stringify({
        logId: userLog,
        breakTypeId: 1,
        breakRequest: true,
      }),
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          this.updatebreakstarttime(response.data.breakId);
        } else {
          alert("Try again later");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  updatebreakstarttimeSecond = (auth_token, breakId) => {
    fetch(
      `https://cors-anywhere.herokuapp.com/${this.baseApiUrl}/wglcs/updatebreakstarttime`,
      {
        method: "POST",
        headers: new Headers({
          "access-token": "pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S",
          Authorization: "Bearer " + auth_token,
          "Content-Type": "application/json-patch+json",
          accept: "text/plain",
          "api-version": "v1",
        }),

        body: JSON.stringify({
          breakId: breakId,
          breakRequest: true,
        }),
      }
    )
      .then((response) => response.json())
      .catch((err) => {
        console.log(err);
      });
  };

  updatebreakendtimeSecond = (auth_token, UserBreakId) => {
    fetch(
      `https://cors-anywhere.herokuapp.com/${this.baseApiUrl}/wglcs/updatebreakendtime`,
      {
        method: "POST",
        headers: new Headers({
          "access-token": "pnqxdcABJPkKu0IvtjNvtWqD6iNUxqBaxivBrJwzUfNv4Nbq1S",
          Authorization: "Bearer " + auth_token,
          "Content-Type": "application/json-patch+json",
          accept: "text/plain",
          "api-version": "v1",
        }),

        body: JSON.stringify({
          breakId: UserBreakId,
        }),
      }
    ).then((response) => response.json());
  };
  forgetPassword = (email) => {
    fetch(`${this.baseApiUrl}/wglcs/forgetpassword?userEmail=${email}`, {
      method: "GET",
      headers: new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        accept: "application/json",
        "callback-url": `${this.baseUrl}/${utils.StripStartAndTrailingSlashes(
          process.env.PUBLIC_URL.trim()
        )}/newPassword/:t=[TOKEN]`,
      }),
    }).then((response) => response.json());
  };

  //...................................Chat Transcript Service Calls
  getallusersofempcompany = (
    empCompanyId
  ): Promise<AxiosResponse<ApiResult<AgentsMDL[]>>> =>
    this.instance.get(
      `wglcs/getallusersofempcompany?empCompanyId=${empCompanyId}`
    );
  getwebsitesbyempCompany = (
    empCompanyId
  ): Promise<AxiosResponse<ApiResult<EmployeCompanyWebMDL[]>>> =>
    this.instance.get(
      `wglcs/getwebsitesbyempCompany?empCompanyId=${empCompanyId}`
    );
  getuserinterectedchattranscripts = (
    fromDate,
    toDate,
    userId
  ): Promise<AxiosResponse<ApiResult<ChatTranscriptData[]>>> =>
    this.instance.get(
      `wglcs/getuserinterectedchattranscripts?fromData=${fromDate}&toData=${toDate}&userId=${userId}`
    );
  GetChatInfo = (
    body
  ): Promise<AxiosResponse<ApiResult<ChatTranscriptData[]>>> =>
    this.instance.post(`wglcs/GetChatInfo`, body);
  GetChatTranscriptsWithQCAgent = (
    body
  ): Promise<AxiosResponse<ApiResult<ChatTranscriptData[]>>> =>
    this.instance.post(`wglcs/GetChatTranscriptsWithQCAgent`, body);
  GetChatTranscripts = (
    body
  ): Promise<AxiosResponse<ApiResult<ChatTranscriptData[]>>> =>
    this.instance.post(`wglcs/GetChatTranscripts`, body);
  getenableusersbycompany = (
    empCompanyId
  ): Promise<AxiosResponse<ApiResult<EnableAgentsMDL[]>>> =>
    this.instance.get(
      `wglcs/getenableusersbycompany?empCompanyId=${empCompanyId}`
    );

  //...................................resources Pool    by asad noman
  GetUsersByCompany = (
    empCompanyId
  ): Promise<AxiosResponse<ApiResult<AllResourcesData[]>>> =>
    this.instance.get(`wglcs/GetUsersByCompany?empCompanyId=${empCompanyId}`);
  getusersbycompany_serviceonly = (
    empCompanyId
  ): Promise<AxiosResponse<ApiResult<AllResourcesData[]>>> =>
    this.instance.get(
      `wglcs/getusersbycompany_serviceonly?empCompanyId=${empCompanyId}`
    );
  getusertraninginfobyuserid = (
    userId
  ): Promise<AxiosResponse<ApiResult<UserTrainingInfo[]>>> =>
    this.instance.get(`wglcs/getusertraninginfobyuserid?userId=${userId}`);
  getallstatuses = (): Promise<AxiosResponse<ApiResult<WebsiteStatus[]>>> =>
    this.instance.get(`wglcs/getallstatuses`);
  getwebsitesbyempcompany_serviceonly = (
    empCompanyId
  ): Promise<AxiosResponse<ApiResult<EmployeCompanyWebMDL[]>>> =>
    this.instance.get(
      `wglcs/getwebsitesbyempcompany_serviceonly?empCompanyId=${empCompanyId}`
    );
  getroleinterfaces = (): Promise<AxiosResponse<ApiResult<RoleInterface[]>>> =>
    this.instance.get(`wglcs/getroleinterfaces`);
  saveusertrainedon = (body): Promise<AxiosResponse<ApiResult<string>>> =>
    this.instance.post(`wglcs/saveusertrainedon`, body);
  getemployeecompanyies = (): Promise<
    AxiosResponse<ApiResult<employeeCompanyMDL[]>>
  > => this.instance.get(`wglcs/getemployeecompanyies`);
  getempcompanylanguagesdetail = (): Promise<
    AxiosResponse<ApiResult<LanguageMDL[]>>
  > => this.instance.get(`wglcs/getempcompanylanguagesdetail`);
  getrolesbyempcompanyid = (
    empCompanyId
  ): Promise<AxiosResponse<ApiResult<companyRoleMDL[]>>> =>
    this.instance.get(
      `wglcs/getrolesbyempcompanyid?empCompanyId=${empCompanyId}`
    );
  updateuserinfo_v2 = (body): Promise<AxiosResponse<ApiResult<string>>> =>
    this.instance.post(`wglcs/updateuserinfo_v2`, body);
  insertuserinfobll_v2 = (body): Promise<AxiosResponse<ApiResult<string>>> =>
    this.instance.post(`wglcs/insertuserinfobll_v2`, body);
  setuserstatus = (body): Promise<AxiosResponse<ApiResult<string>>> =>
    this.instance.post(`wglcs/setuserstatus`, body);
  picsupload = (body): Promise<AxiosResponse<ApiResult<string>>> => {
    var imageInstance = axios.create({
      baseURL: "https://blue.thelivechatsoftware.com/ChatAppApi/api/",
      headers: {
        "Content-Type": "multipart/form-data",
        "Access-Control-Allow-Origin": "*",
      },
      timeout: 200000,
    });

    var res = imageInstance.post<ApiResult<string>>("wglcs/picsupload", body);
    return res;
  };
  shareImagesToUpload = async (
    body
  ): Promise<AxiosResponse<ApiResult<string>>> => {
    var imageInstance = axios.create({
      baseURL: "https://thelivechatsoftware.com/FileUploader/api/",
      headers: {
        "Content-Type": "multipart/form-data",
        // 'Access-Control-Allow-Origin': '*',
      },
      timeout: 200000,
    });

    var res = await imageInstance.post<ApiResult<string>>(
      "FileUploader/FileTransfer3_5_OP",
      body
    );
    return res;
  };
  //...................................reports     by asad noman
  depdashboard_websitestats_userwise = (
    body
  ): Promise<AxiosResponse<ApiResult<string>>> =>
    this.instance.post(`wglcs/depdashboard_websitestats_userwise`, body);
  depdashboard_websitestats_hourwise = (
    body
  ): Promise<AxiosResponse<ApiResult<string>>> =>
    this.instance.post(`wglcs/depdashboard_websitestats_hourwise`, body);
  depdashboard_websitestats_daywise = (
    body
  ): Promise<AxiosResponse<ApiResult<string>>> =>
    this.instance.post(`wglcs/depdashboard_websitestats_daywise`, body);
  depdashboardwebsitestats_comanaged = (
    body
  ): Promise<AxiosResponse<ApiResult<string>>> =>
    this.instance.post(`wglcs/depdashboardwebsitestats_comanaged`, body);
}

var wglcsApiService = new WglcsApiService();
export { wglcsApiService };
