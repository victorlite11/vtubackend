import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { ITVSubscription } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId, getApiCredentialsBase64 } from 'src/modules/shared/utils/main.utils';

const axios: AxiosInstance = require("axios")

@Injectable()
export class TvSubscriptionService {
    
    constructor(
        @Inject('VTPASS_BASE_URL') private api_url: string
    ) {}

    async recharge(op: ITVSubscription) : Promise<any> {
        let payload = {...op, request_id: generateRandomId()}
        // validate smart card
        let validation = await this.validateSmartCardNumber({
            billersCode: op.billersCode,
            serviceID: op.serviceID
        })

        if (!(validation.code == '000')) {
            return validation;
        }

        // perform purchase
        return await axios.post(`${this.api_url}/pay`, payload, {headers: {Authorization: `Basic ${getApiCredentialsBase64()}`}}).then(r => {
            return r.data
        }).catch( e => {
            return e
        })
    }

    async getVariations(network: 'dstv' | 'gotv' | 'startimes') : Promise<any> {
        return await axios.get(`${this.api_url}/service-variations?serviceID=${network}`, {headers: {Authorization: `Basic ${getApiCredentialsBase64()}`}}).then(r => {
            return r.data
        }).catch( e => {
            return e
        })
    }

    async validateSmartCardNumber(payload: {serviceID: string, billersCode: string}) {
        console.log('---- Validating TV Subscriber Smart Card Number')
        return await axios.post(`${this.api_url}/merchant-verify`, payload, {headers: {Authorization: `Basic ${getApiCredentialsBase64()}`}}).then(r => {
            console.log("---- Subscriber Successfully validated.")
            console.log("---- Subscriber Details:")
            console.log(r.data)
            return r.data
        }).catch( e => {
            return e
        })
    }
}
