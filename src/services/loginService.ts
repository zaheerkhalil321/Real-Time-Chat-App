import { wglcsApiService } from './WglcsApiService'
import { IOperationResult, LoginModel, LoginResponse } from '../models/index';
import EventEmitter from './eventemitter';
import { chatService } from '../services/chatService';


import { Events } from '../models/events';

class LoginService {

    constructor() {
        EventEmitter.on(Events.onOperatorLogOut, this.logout);
    }

    private static readonly tokenKey = 'authToken';
    private static readonly userData = 'USER_DATA';

    async login(email: string, password: string, licenseKey: string): Promise<IOperationResult<LoginResponse>> {

        // TODO. Set IP Address and PC Name.
        let obj: LoginModel = {
            userName: email,
            password: password,
            licenseKey: licenseKey,
            ipAddress: "127.0.0.1",
            computerName: "IOS"
        }

        try {

            var result = await wglcsApiService.signIn(obj);


            if (result.data && result.data.status) {

                wglcsApiService.setAuth(result.data.data.accessToken.auth_token);  

                return { data: result.data.data, success: true } as IOperationResult<LoginResponse>;

            } else {
                throw new Error(`Authentication Failed with Error: ${result.data?.msg} `)
            }

        } catch (error) {
            return { message: error.toString(), success: false } as IOperationResult<LoginResponse>;
        }
    }

    logout = async (reason: string | null = null) => {

        console.info('logging out due to reason: ' + reason);

        var data = JSON.parse(localStorage.getItem('USER_DATA')!);

        await chatService.disconnect();

        await wglcsApiService.updateoperatorwindowstate(data.userLoginData.userLog, false);

        await localStorage.clear();
        await window.location.reload();
    }
}

var loginService = new LoginService();
export { loginService };