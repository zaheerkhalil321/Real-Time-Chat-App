import { LoginResponse } from "../models";

class UserService {

    public GetUserData() : LoginResponse | null {
        var userData = (JSON.parse(localStorage.getItem('USER_DATA')!)) as LoginResponse;

        if(userData == null) {
            return null;
        }

        return userData;
    }
}


var userService = new UserService();
export { userService };
