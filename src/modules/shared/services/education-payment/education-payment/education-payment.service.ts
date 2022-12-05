import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { IEducationPayment } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId, getApiCredentialsBase64 } from 'src/modules/shared/utils/main.utils';

const axios: AxiosInstance = require("axios")

@Injectable()
export class EducationPaymentService {
        
    constructor(
        @Inject('VTPASS_BASE_URL') private api_url: string
    ) {}

    async recharge(op: IEducationPayment) : Promise<any> {
        let payload = {...op, request_id: generateRandomId()}
 

        // perform purchase
        return await axios.post(`${this.api_url}/pay`, payload, {headers: {Authorization: `Basic ${getApiCredentialsBase64()}`}}).then(r => {
   
            return r.data
        }).catch( e => {

            return e
        })
    }

    async getVariations(serviceId: 'waec' | 'waec-registration') : Promise<any> {
        return await axios.get(`${this.api_url}/service-variations?serviceID=${serviceId}`, {headers: {Authorization: `Basic ${getApiCredentialsBase64()}`}}).then(r => {
            return r.data
        }).catch( e => {

            return e
        })
    }
}
