import { Inject, Injectable } from '@nestjs/common';
import { Feedback } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId, getNearlyFreeApiCredentialsBase64 } from 'src/modules/shared/utils/main.utils';
import { AccountService } from '../../account/account/account.service';


const axios = require("axios");

export enum NEARLYFREE_ENDPOINTS {
    SERVICES = "products",
    PURCHASE = "purchase",
    PLANS = "plans"
}

export enum NEARLYFREE_SERVICES {
    TV = "Tv", ELECTRICITY = "Electricity", DATA = "Data", AIRTIME = "AIRTIME", EXAMINATION = "EXAMINATION"
}

export interface INearlyFreePurchasePayload {
    purchase : string;
    referenceId: string;
    network: string; //networkId
    plan: string; //planId
    amount ?: number; // for airtime
    phoneNumber: string;
    iucNumber ?: string; // only for tv:smartCardNumber and electricity:MetreNumber
    quantity ?: number; // only for examination e-pins
}

export interface INearlyFreeServiceNetwork {
    "service": string,
    "network": string,
    "networkId": string,
    "price": string,
    "minimum": string,
    "maximum": string
}

export interface INearlyFreeServicePlan {
    plan: string,
    planId: string,
    price: string,
    minimum: string,
    maximum: string
}

@Injectable()
export class NearlyfreeService {

    
    constructor(
        @Inject('NEARLYFREE_BASE_URL') private apiurl: string,
        private accountService: AccountService
    ) {}

    async purchaseService(arg0: { purchasePayload: INearlyFreePurchasePayload; user: any; }): Promise<Feedback<any>> {
        // first deduct the money from the users wallet,
        // check the transaction object to see if it is successful. if not, add the money back
        return this.accountService.chargeCustomer({user: arg0.user, amount: Number(arg0.purchasePayload.amount)}).then(r => {
            if (r.success) {

                arg0.purchasePayload.referenceId = generateRandomId(6);
                const config = this.getConfig({method: 'post', endpoint: NEARLYFREE_ENDPOINTS.PURCHASE, data: arg0.purchasePayload});
                console.log(config)
                return axios(config).then((r) => {
                    console.log(r)
                    return {
                        success: r.data.status && r.data.status == 'successful' ? true : false, 
                        msg: r.data.description,
                        data: r.data
                    }
                }).catch(function (error) {
                    return {
                        success: false,
                        msg: `Not successful`,
                        data: error?.response?.data
                    }
                });

            } else {

            }
        })
                
                // if (chargeCustomerResp.success) {
                //     const resp = await this.datawayService.pay(payload); 

                //     if (resp.success) {
                //         // save to transactions history
                //         const trx = new Transaction();
                //         trx.amount = Number(payload.amount);
                //         trx.date = resp.data.date;
                //         trx.phone = req.headers['user'].info.phone;
                //         trx.recipient = payload.billerIdentifier;
                //         trx.reference = resp.data.external_reference;
                //         trx.service = payload.serviceSlug;

                //         await this.transactionService.saveTransaction(trx);

                //         // return payment object
                //         return resp;
                //     } else {
                //         // refund customer and return the resp object
                //         await this.accountService.refundCustomer({user: req.headers['user'], amount: Number(payload.amount)});
                //         return resp;
                //     }
                // } else {
                //     return chargeCustomerResp
                // }
    }


    async getServicePlans(arg0: { networkId: string; }) : Promise<Feedback<INearlyFreeServicePlan>> {
        const config = this.getConfig({endpoint: NEARLYFREE_ENDPOINTS.PLANS, queries: `network=${arg0.networkId}`});
        return axios(config).then((r) => {
            console.log(r)
            return {
                success: r.data.status && r.data.status == 'successful' ? true : false, 
                msg: r.data.description,
                data: r.data.content.plans
            }
        }).catch(function (error) {
            return {
                success: false,
                msg: "Could not retrieve service plans",
                data: error?.response?.data
            }
        });
    }


    async getServices(op: {service: NEARLYFREE_SERVICES}) : Promise<Feedback<any>> {

        const config = this.getConfig({endpoint: NEARLYFREE_ENDPOINTS.SERVICES, queries: `service=${op.service}`})
        return axios(config).then((r) => {
            return {
                success: r.data.status && r.data.status == 'successful' ? true : false, 
                msg: r.data.description,
                data: r.data.content.networks
            }
        }).catch(function (error) {
            return {
                success: false,
                msg: "Could not retrieve service categories",
                data: error?.response?.data
            }
        });
    }

    private getConfig(op: {method ?: string, endpoint: NEARLYFREE_ENDPOINTS, queries?: string, parameter ?: string, data ?: any}) : {method: string, url: string, headers: object} {
        let config = {
            method: op.method || 'get',
            url: `${this.apiurl}/${op.endpoint}${op.parameter ? '/' + op.parameter : ''}${op.queries ? '?' + op.queries : ''}`,
            headers: { Authorization: `Basic ${getNearlyFreeApiCredentialsBase64()}` },
            data : op.data || {}
        };

        return config;
    }
}
