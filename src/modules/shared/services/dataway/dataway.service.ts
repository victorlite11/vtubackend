import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { generateRandomId, getApiCredentialsBase64 } from 'src/modules/shared/utils/main.utils';
import { Feedback, Transaction } from '../../interfaces/main.interfaces';

import { env } from "../../environment/environment";
import { AccountService } from '../account/account/account.service';
import { User } from '../create-user/create-user/create-user.service';
import { TransactionsService } from '../transactions/transactions/transactions.service';
import { CompService } from '../comp/comp/comp.service';

const FormData = require('form-data');
const axios = require("axios")

export enum DATAWAY_ENDPOINTS {
    SERVICE_CATEGORIES = "get-service-categories",
    SERVICES = "get-services",
    SERVICE_VARIATIONS = "get-service-variations",
    VALIDATE_BILLER = "validate-biller",
    PAY = "vend",
    QUERY_TRANSACTION = "query-transaction",
    WALLET_BALANCE = "balance"
}

export interface IDatawayServiceCategory {
    name: "Airtime" | "Data" | "TV" | "Power" | "Internet Services" | "Education" | "Auto Insurance" | "Betting";
    slug: "airtime" | "data" | "TV" | "power" | "internet-services" | "education" | "auto-insurance" | "betting";
    status: "active" | "inactive";
}

export interface IDatawayService {
    name: string,
    slug: string,
    variation_label: any,
    biller_identifier_name: string,
    status: "active"
}

export interface IDatawayServiceVariation {
    name: string;
    slug: string;
    amount: number;
    fixed_price: "yes" | "no";
    status: "active" | "inactive";
    new_amount: number;
}


export enum DatawayServiceCategorySlug {
    AIRTIME = "airtime",
    DATA = "data",
    TV = "TV",
    POWER = "power",
    INTERNET_SERVICES = "internet-services",
    EDUCATION = "education",
    AUTO_INSURANCE = "auto-insurance",
    BETTING = "betting"
}

export interface IDatawayFeedback {
    response_code: string;
    response_message: string;
    response_description: string;
    data: DatawayService[]
}

// only relevant to power and tv
export interface IDatawayBillerValidationPayload {
    serviceSlug: string, 
    billerIdentifier: string, // meter number or smart card number
    variationSlug: string // compulsory for power
}

export interface IDatawayPaymentPayload extends IDatawayBillerValidationPayload {
    // billerIdentifier includes phone numbers, meter numbers or smart card numbers
    amount: string,
    reference?: string,
}

export interface IDatawayPaymentSuccessFeedback {
    "external_reference": string,
    "reference": string,
    "status": "Successful",
    "amount": string | number,
    "date": string,
    "title": string,
    "commission": string | number,
    "extras": any[]
}

@Injectable()
export class DatawayService {

    constructor(
        @Inject('DATAWAY_BASE_URL') private apiurl: string,
        private accountService : AccountService,
        private ceeService : CompService,
        private transactionService : TransactionsService
    ) {}

    async getServiceCategories() : Promise<Feedback<IDatawayServiceCategory[]>> {
        let config = {
            method: 'get',
            url: `${this.apiurl}/${DATAWAY_ENDPOINTS.SERVICE_CATEGORIES}`,
            headers: { }
        };

        return await axios(config).then((r) => {
            if(r.data.response_code == "000") {
                return {
                    success: true,
                    msg: "Service categories retrieved",
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            } else {
                return {
                    success: false,
                    msg: "Could not retrieve service categories",
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            }
        }).catch(function (error) {
            return {
                success: false,
                msg: "Could not retrieve service categories",
                data: error?.response?.data
            }
        });
    }

    async getServices(op: {slug: DatawayServiceCategorySlug}) : Promise<Feedback<DatawayService[]>> {
        let config = {
            method: 'get',
            url: `${this.apiurl}/${DATAWAY_ENDPOINTS.SERVICES}?slug=${op.slug}`,
            headers: { }
        };

        return await axios(config).then((r) => {
            if(r.data.response_code == "000") {
                return {
                    success: true,
                    msg: `${op.slug} services retrieved`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            } else {
                return {
                    success: false,
                    msg: `Could not retrieve ${op.slug} services`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            }
        }).catch(function (error) {
            return {
                success: false,
                msg: `Could not retrieve ${op.slug} service`,
                data: error?.response?.data
            }
        });
    }

    async getServiceVariationsWithCommission(op: {serviceSlug: any}) : Promise<Feedback<IDatawayServiceVariation[]>> {
        const cee = await this.ceeService.getCEE()

        return await this.getServiceVariations(op).then(r => {
            if (r.success) {
              let d = r.data.map((variation : IDatawayServiceVariation) => {
                    // add commission
                    if (op.serviceSlug.includes('data')) {
                        let actualAmount = variation.amount;
                        // data sub
                        variation.amount = Math.round(Number(variation.amount) + Number(cee.data.settings.commissionSetting.datasubCharge))
                        variation.name = variation.name.replace(actualAmount.toString(), Math.round(variation.amount).toString()); 
                        if (op.serviceSlug.includes('airtel-data')) {
                            variation.name = variation.name.replace(Math.floor(actualAmount + 1).toString(), Math.round(variation.amount).toString()); 
                        }
                        variation.name = variation.name.replace(`${Math.floor(variation.amount).toString()}MB`, `${actualAmount.toString()}MB`); // fix inappropriate replacements
                                        
                    }
                    return variation;
                })  
                return {
                    ...r,
                    d: d
                }
            }
        })
    }

    async getServiceVariations(op: {serviceSlug: any}) : Promise<Feedback<IDatawayServiceVariation[]>> {

        let config = {
            method: 'get',
            url: `${this.apiurl}/${DATAWAY_ENDPOINTS.SERVICE_VARIATIONS}?service_slug=${op.serviceSlug}`,
            headers: { }
        };

        return await axios(config).then((r) => {
            if(r.data.response_code == "000") {
                let d = (r?.data)?.data;
                return {
                    success: true,
                    msg: `${op.serviceSlug} service variations retrieved`,
                    data: d
                }
            } else {
                return {
                    success: false,
                    msg: `Could not retrieve ${op.serviceSlug} service variations`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            }
        }).catch(function (error) {
            return {
                success: false,
                msg: `Could not retrieve ${op.serviceSlug} service variations`,
                data: error?.response?.data
            }
        });
    }

    async validateBiller(op: IDatawayBillerValidationPayload) : Promise<Feedback<any>> {
        // create formdata object holding the validation information
        let data = new FormData();
        data.append('service_slug', op?.serviceSlug || "");
        data.append('biller_identifier', op?.billerIdentifier || "");
        data.append('variation_slug', op?.variationSlug || "");

        // include auth keys
        data = this.includeAPIKeys({for: 'live', formData: data});

        const config = {
            method: 'post',
            url: `${this.apiurl}/${DATAWAY_ENDPOINTS.VALIDATE_BILLER}`,
            headers: { 
              ...data.getHeaders()
            },
            data : data
        };

        return await axios(config).then((r) => {
            if(r.data.response_code == "000") {
                return {
                    success: true,
                    msg: `Biller validated`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            } else {
                return {
                    success: false,
                    msg: `Unable to validate biller`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            }
        }).catch((error) => {
            return {
                success: false,
                msg: `Unable to validate biller`,
                data: error?.response?.data
            }
        });
    }

    async pay(payload: IDatawayPaymentPayload, user : User) : Promise<Feedback<any>> {

        return await this.accountService.hasEnoughBalance(
            {user: user, trxAmount: Number(payload.amount)}
            ).then(async r => {
            if (r.success) {
                // get dataway balance
                const datawayBalResp = await this.getBalance();

                if (Number(datawayBalResp.data) < Number(payload.amount)) {
                    return {
                        success: false,
                        msg: "Unable to purchase service at the moment. Please retry later"
                    }   
                }

                // purchase
                const resp = await this.vend(payload); 
                if (resp.success) {

                    // first deduct the money from the users wallet
                    const chargeCustomerResp = await this.accountService.chargeCustomer({user: user, amount: Number(payload.amount)})
                    
                    // save to transactions history
                    const trx = new Transaction();
                    trx.amount = Number(payload.amount);
                    trx.date = resp.data.date;
                    trx.phone = user.info.phone;
                    trx.recipient = payload.billerIdentifier;
                    trx.reference = resp.data.external_reference;
                    trx.service = payload.serviceSlug;

                    await this.transactionService.saveTransaction(trx);

                    if (chargeCustomerResp.success) {
                        await this.ceeService.plusCommissionBal(); // add commssion
                    } else {
                        return r;
                    }

                    // return payment object
                    return resp;
                }
            } else {
                return r;
            }
        })
    }

    private async vend(op: IDatawayPaymentPayload) : Promise<Feedback<IDatawayPaymentSuccessFeedback>> {
        // reference must be generated by us
        op.reference = generateRandomId(12);

        // the actual amount will be used to purchase service
        const variations = await this.getServiceVariations({
            serviceSlug: op.serviceSlug
        })

        // setup data
        let data = new FormData();
        data.append('service_slug', op.serviceSlug || "");
        data.append('biller_identifier', op.billerIdentifier || "");
        data.append('variation_slug', op.variationSlug || "");
        if (op.serviceSlug.includes("data")) {
            data.append('amount', variations.data.filter(v => v.slug == op.variationSlug)[0].amount || ""); 
        } else {
            data.append('amount', op.amount || "");
        }
        data.append('reference', op.reference || "");

        // include auth keys
        data = this.includeAPIKeys({for: "live", formData: data});

        const config = {
            method: 'post',
            url: `${this.apiurl}/${DATAWAY_ENDPOINTS.PAY}`,
            headers: { 
              ...data.getHeaders()
            },
            data : data
        };

        return await axios(config).then((r) => {
            if(r.data.response_code == "000") {
                return {
                    success: true,
                    msg: `Transaction successful`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            } else {
                return {
                    success: false,
                    msg: `Transaction not successful`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            }
        }).catch((error) => {
            console.log(error)
            return {
                success: false,
                msg: `Transaction not successful`,
                data: error?.response?.data
            }
        });
    }

    async getTransactionDetails(op: {ref: string}) : Promise<Feedback<IDatawayPaymentSuccessFeedback>> {
        let data = new FormData();
        data.append('reference', op.ref || "");

        // include api keys
        data = this.includeAPIKeys({for: "live", formData: data});

        const config = {
            method: 'post',
            url: `${this.apiurl}/${DATAWAY_ENDPOINTS.QUERY_TRANSACTION}`,
            headers: { 
              ...data.getHeaders()
            },
            data : data
        };

        return await axios(config).then((r) => {
            if(r.data.response_code == "000") {
                return {
                    success: true,
                    msg: `Transaction retrieved`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            } else {
                return {
                    success: false,
                    msg: `Unable to retrieve transaction`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            }
        }).catch((error) => {
            return {
                success: false,
                msg: `Unable to retrieve transaction`,
                data: error?.response?.data
            }
        });
    }

    async getBalance() : Promise<Feedback<string>> {
        let data = new FormData();

        // inlcude api keys
        data = this.includeAPIKeys({for: "live", formData: data});

        const config = {
            method: 'post',
            url: `${this.apiurl}/${DATAWAY_ENDPOINTS.WALLET_BALANCE}`,
            headers: { 
              ...data.getHeaders()
            },
            data : data
        };

        return await axios(config).then((r) => {
            if(r.data.response_code == "000") {
                return {
                    success: true,
                    msg: `Dataway.ng wallet balance retrieved`,
                    data: (<IDatawayFeedback>r?.data)?.data
                }
            } else {
                return {
                    success: false,
                    msg: `Unable to retrieve dataway.ng wallet balance`,
                    data: "0"
                }
            }
        }).catch((error) => {
            return {
                success: false,
                msg: `Unable to retrieve dataway.ng wallet balance`,
                data: error?.response?.data
            }
        });
    }

    private includeAPIKeys(op: {for : 'live' | "live", formData ?: FormData}) : FormData {
        var data = op.formData || new FormData();
        data.append('api_public_key', (op.for == "live") ? env.dataway.live.API_PUB_KEY :  env.dataway.live.API_PUB_KEY || "");
        data.append('api_private_key', (op.for == "live") ? env.dataway.live.API_PRIV_KEY :  env.dataway.live.API_PRIV_KEY || "")
        return data;
    }
}