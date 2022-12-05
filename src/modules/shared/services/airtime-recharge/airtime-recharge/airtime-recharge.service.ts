import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { IAirtimeRecharge } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId, getApiCredentialsBase64 } from 'src/modules/shared/utils/main.utils';

const axios: AxiosInstance = require("axios")

@Injectable()
export class AirtimeRechargeService {

    constructor(
        @Inject('VTPASS_BASE_URL') private api_url: string
    ) {}

    async recharge(op: IAirtimeRecharge) : Promise<any> {
        let payload = {...op, request_id: generateRandomId()}
        
        return await axios.post(`${this.api_url}/pay`, payload, {headers: {Authorization: `Basic ${getApiCredentialsBase64()}`}}).then(r => {

            return r.data
        }).catch( e => {
  
            return e
        })
    }
}
