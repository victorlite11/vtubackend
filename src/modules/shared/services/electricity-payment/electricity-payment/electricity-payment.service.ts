import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { IElectricityPayment } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId, getApiCredentialsBase64 } from 'src/modules/shared/utils/main.utils';


const axios: AxiosInstance = require("axios")

@Injectable()
export class ElectricityPaymentService {

    constructor(
        @Inject('VTPASS_BASE_URL') private api_url: string
    ) {}

    async recharge(op: IElectricityPayment) : Promise<any> {
        let payload = {...op, request_id: generateRandomId()}

        // validate smart card
        let validation = await this.validateMetreNumber({
            billersCode: op.billersCode,
            serviceID: op.serviceID,
            type: op.variation_code
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

    async validateMetreNumber(payload: {serviceID: string, billersCode: string, type: 'prepaid' | 'postpaid'}) {
        console.log('----- Validating Customer Metre Number/Account ID')
        return await axios.post(`${this.api_url}/merchant-verify`, payload, {headers: {Authorization: `Basic ${getApiCredentialsBase64()}`}}).then(r => {
            console.log("---- Customer Successfully validated.")
            console.log("---- Customer Details:")
            console.log(r.data)
            return r.data
        }).catch( e => {
            return e
        })
    }
}
