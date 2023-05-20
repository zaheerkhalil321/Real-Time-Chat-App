import { AxiosResponse } from "axios";

class CacheService {
    private storage = {};

    get = async (key: string, callback: () => Promise<AxiosResponse<any>>) => {
        var existingValue = this.storage[key];
        if(existingValue != null && existingValue != undefined) {
            return existingValue;
        }

        const result = await callback();

        // Only if Request Response is 200
        if(result.status.toString()[0] === '2') {
            this.storage[key] = result;
        }

        return result;
    }
}


var cacheService = new CacheService();

export {
    cacheService
}
