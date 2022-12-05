import { Inject, Injectable } from '@nestjs/common';
import { DepositToken, Feedback, IMonnifyReservedAccount, IUser } from '../../interfaces/main.interfaces';
import { generateRandomId, getBase64StringOf } from '../../utils/main.utils';
import { AccountService } from '../account/account/account.service';
import { UserService } from '../create-user/create-user/create-user.service';
import { DbMediatorService } from '../db-mediator/db-mediator/db-mediator.service';

const axios = require("axios");

export interface ICustomerReservedAccountPayload {
	accountReference: string,
	accountName: string,
	currencyCode: "NGN",
	contractCode: string,
	customerEmail: string,
	bvn: string,
	customerName: string,
	getAllAvailableBanks: true
}

@Injectable()
export class MonnifyService {

    constructor(
        @Inject("MONNIFY_API_SECRET_KEY") private apiSecretKey : string,
        @Inject("MONNIFY_API_KEY") private apiKey : string,
        @Inject("MONNIFY_BASE_URL") private baseurl : string,
        @Inject("MONNIFY_DEFAULT_CONTRACT_CODE") private contractCode : string,
        @Inject("BVN") private bvn : string,
        private dbMediator : DbMediatorService,
        private usersService : UserService,
        private accountService: AccountService
    ) {}

    async processPaymentCompletion(payload: any) {

        if (payload) {
            if (payload.eventType == "SUCCESSFUL_TRANSACTION") {
                let eventData = payload.eventData; // can get transaction ref from here
                //eventData.settlementAmount
                if (eventData.product.type == "RESERVED_ACCOUNT") {

                    const deposit = await this.dbMediator.fetchOne <DepositToken> (
                        {_id : eventData.paymentReference},
                        {collection: "deposit-history", db: "classyempireenterprise"}
                    )

                    if(deposit.success) {
                        // payment already registered
                        return;
                    }

                    let customer = eventData.customer; // has email and name

                    const user = await this.usersService.getUserWithEmail({email: customer.email});
    
                    if (user.success) {
                        console.log(user)
                        // credit wallet
                        return await this.accountService.creditWallet({user: user.data, amount: Number(eventData.amountPaid), isAdmin: user.data.hasOwnProperty('supremacy') ? true : false, intendedId : eventData.paymentReference});
    
                    } else {
                        console.error("Unable to complete transaction")
                    }

                }
            } else {
                console.log("called instead")
            }
        }
    }

    async createReservedAccounts(user : IUser) : Promise<Feedback<any>> {

        if (user.account) {
            if (user.account.monnifyReservedAccountRef) {
                const reservedAccounts = await this.getReservedAccounts(user);
                if (reservedAccounts.success) {
                    return reservedAccounts;
                }
            }
        }

        const reserveAcctPayload : ICustomerReservedAccountPayload = {
            "accountReference": generateRandomId(9),
            "accountName": user.info.fullname,
            "currencyCode": "NGN",
            "contractCode": this.contractCode,
            "customerEmail": user.info.email,
            "bvn": this.bvn,
            "customerName": user.info.fullname,
            "getAllAvailableBanks": true
        }

        let config = {
            method: 'post',
            url: `${this.baseurl}/api/v2/bank-transfer/reserved-accounts`,
            headers: { Authorization: `Bearer ${await this.getAccessToken()}` },
            data: reserveAcctPayload
        };

        return axios(config).then(async (r) => {
            if (r.data.requestSuccessful) {
                return await this.dbMediator.updateOne <IUser> ({"info.phone": user.info.phone}, {
                    $set: {
                        "account": {
                            monnifyReservedAccountRef: reserveAcctPayload.accountReference
                        }
                    } 
                },{collection: user.hasOwnProperty('supremacy') ? "admins" : "users", db: "classyempireenterprise"}).then(r => {
                    return {
                        success: true,
                        msg: "Reserve accounts created successfully",
                        data: r.data
                    };
                }) 

            } else {
                return {
                    success: false,
                    msg: "Unable to create reserve accounts"
                }
            }

        }).catch((error) => {
            return {
                success: false,
                msg: "Unable to create reserve accounts"
            }
        });
    }

    async getReservedAccounts(user : IUser) : Promise<Feedback<IMonnifyReservedAccount[]>> {

        let config = {
            method: 'get',
            url: `${this.baseurl}/api/v2/bank-transfer/reserved-accounts/${user?.account?.monnifyReservedAccountRef}`,
            headers: { Authorization: `Bearer ${await this.getAccessToken()}` }
        };

        return axios(config).then((r) => {
            if (r.data.requestSuccessful) {
                return {
                    success: true,
                    msg: "Reserved accounts retrieved successfully",
                    data: r.data.responseBody.accounts
                } 
            } else {
                return {
                    success: false,
                    msg: r.data.responseMessage
                }  
            }
            
        }).catch((error) => {
            return {
                success: false,
                msg: error?.response?.data?.responseMessage
            }
        });

    }

    private async getAccessToken() : Promise<string> {
        
        let config = {
            method: 'post',
            url: `https://api.monnify.com/api/v1/auth/login`,
            headers: { Authorization: `Basic ${getBase64StringOf(`${this.apiKey}:${this.apiSecretKey}`)}` },
        };

        return axios(config).then((r) => {
            return r.data.responseBody.accessToken;
        }).catch((error) => {
        });
    }
}
