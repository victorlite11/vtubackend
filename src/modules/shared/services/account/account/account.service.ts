import { Inject, Injectable } from '@nestjs/common';
import { DepositToken, Feedback, IMonnifyOnlinePayResponse, Transaction } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId, getBase64StringOf } from 'src/modules/shared/utils/main.utils';
import { Admin, AdminService } from '../../admin/admin/admin.service';
import { User, UserService } from '../../create-user/create-user/create-user.service';
import { DbMediatorService } from '../../db-mediator/db-mediator/db-mediator.service';
import { MonnifyService } from '../../monnify/monnify.service';

const axios = require("axios");

@Injectable()
export class AccountService {
    constructor(
        private dbMediator: DbMediatorService,
        private userService: UserService,
        @Inject("MONNIFY_BASE_URL") private apiUrl : string,
        @Inject("MONNIFY_API_SECRET_KEY") private apiSecretKey : string,
        @Inject("MONNIFY_API_KEY") private apiKey : string,
    ) {}

    async getCustomersBalance(): Promise<Feedback<number>> {
        const users = await this.userService.getUsers();
        if (users.success) {
            return {
                msg: "Customers total balance retrieved successfully",
                success: true,
                data: users.data.map(user => user.wallet.balance).reduce((a, b) => a + b)
            }
        } else {
            return {
                ...users,
                data: 0
            };
        }
    }

    async getDepositToken(arg0: { phone: string; }): Promise<Feedback<DepositToken>> {
        return await this.dbMediator.fetchOne <DepositToken> ({phone: arg0.phone}, {db: "classyempireenterprise", collection: "deposit-tokens"});
    }

    async getDepositTokens(): Promise<Feedback<DepositToken[]>> {
        return await this.dbMediator.fetchAll <DepositToken> ({}, {db: "classyempireenterprise", collection: "deposit-tokens"});
    }

    async deleteDepositToken(arg0: { token: string; }): Promise<Feedback<{ amount: number, token: string }>> {
        return await this.dbMediator.deleteOne <DepositToken> ({token: arg0.token}, {db: "classyempireenterprise", collection: "deposit-tokens"}).then(r => {
            if (r.success) {
                return {
                    success: true,
                    msg: "Delete successful"
                }
            } else {
                return {
                    success: false,
                    msg: "Delete unsuccessful"
                }
            }
        })
    }

    async confirmAndCompleteFunding(payload: IMonnifyOnlinePayResponse, user : User): Promise<Feedback<any>> {
        //let accessToken = await this.monnifyService.getAccessToken()

        let config = {
            method: 'get',
            url: `${this.apiUrl}/transactions/query?paymentReference=${payload.paymentRef}`,
            headers: { Authorization: `Basic ${getBase64StringOf(`${this.apiKey}:${this.apiSecretKey}`)}` },
        };

        return axios(config).then(async (r) => {
            if (r.data.responseBody.paymentStatus) {
                // fund user
                // first check if this transaction has already been registered before funding user
                const deposit = await this.dbMediator.fetchOne <Transaction> ({_id: payload.paymentRef}, {db: "classyempireenterprise", collection: "deposit-history"})

                if (deposit.success) {
                    return {
                        success: false,
                        msg: "Wallet already funded"
                    }
                }
                // credit wallet
                return await this.creditWallet({user: user, amount: r.data.responseBody.amount, isAdmin: user.hasOwnProperty('supremacy') ? true : false, intendedId : payload.paymentRef});

            } else {
                return {
                    success: false,
                    msg: r.data.responseMessage
                }
            }
        }).catch((error) => {
            console.log(error)
        });
    }

    async fundCustomer(payload: { phone: string, amount: number }): Promise<Feedback<any>> {
        const resp = await this.userService.getUser({phone: payload.phone}) as Feedback<User | Admin>;
        
        if (resp.success) {
            // fund wallet
            return await this.creditWallet({user: resp.data, amount: payload.amount, isAdmin: resp.data.hasOwnProperty('supremacy') ? true : false});
        } else {
            return resp;
        }
    }

    async confirmDeposit(payload: { token: string }): Promise<Feedback<{ amount: number, confirmed: boolean, token: string }>> {
        // retrive token
        const fetchedToken = await this.dbMediator.fetchOne <DepositToken> ({token: payload.token}, {collection: "deposit-tokens", db: "classyempireenterprise"});
        if (!fetchedToken.success) {
            return {
                success: false,
                msg: "Token invalid"
            };
        }

        // get the user
        return await this.dbMediator.fetchOne <User> ({"info.phone": fetchedToken.data.phone}, {db: "classyempireenterprise", collection: "users"}).then( async r => {
            let isAdmin = false;

            if (!r.success) {

                const resp = await this.dbMediator.fetchOne <Admin> ({"info.phone": fetchedToken.data.phone}, {db: "classyempireenterprise", collection: "admins"});
                
                if (resp.success && resp.data) {
                    isAdmin = true;
                    r = resp; // save this response in the user fetch response object
                } else {
                    return {
                        success: false,
                        msg: 'No user associated with this deposit token',
    
                    }                    
                }
            }

            // credit wallet
            return await this.creditWallet({depositToken: fetchedToken.data, isAdmin: isAdmin, amount: fetchedToken.data.amount, user: r.data});
        })
    }

    async creditWallet(op: {depositToken ?: DepositToken, user : User | Admin, amount : number, isAdmin : boolean, intendedId ?: string}) : Promise<Feedback<any>> {
        // save the amount in the user's or admin's wallet balance
        console.log(op);
        return await this.dbMediator.updateOne <User> ({"info.phone": op?.user?.info?.phone}, {$set: {
            'wallet.balance': op.user.wallet.balance + Number(op.amount)
        }}, {db: "classyempireenterprise", collection: op.isAdmin ? "admins" : "users"}).then(async r => {
            if (r.success) {
                const tkn = generateRandomId();
                const d = Object.assign(op.depositToken || {
                    date: new Date().toISOString(),
                    _id: op.intendedId ? op.intendedId : tkn,
                    token: tkn,
                    phone: op?.user?.info?.phone || "undefined",
                    confirmed: true
                } as DepositToken, {});
                d.confirmed = true;

                if (op.depositToken) {
                    await this.dbMediator.deleteOne <DepositToken> ({token: op.depositToken.token}, {db: "classyempireenterprise", collection: "deposit-tokens"});
                }

                // save deposit to history
                const saveToHistoryResp = await this.dbMediator.insertOne <DepositToken> (d, {db: "classyempireenterprise", collection: "deposit-history"});

                if (saveToHistoryResp.success) {
                    return {
                        success: true,
                        msg: op.isAdmin ? 'Admin wallet credited' : 'Customer wallet credited',
                        data: {amount: d.amount, confirmed: d.confirmed, token: d.token}
                    } 
                } else {
                    return {
                        success: true,
                        msg: 'wallet credit successful but unable to update history'
                    }
                }
            } else {
                return {
                    success: false,
                    msg: op.isAdmin ? 'Unable to credit admin wallet' : 'Unable to credit Customer wallet'
                }
            }
        })
    }

    async createDepositToken(op: { phone: string, amount: number }): Promise<Feedback<DepositToken>> {

        // check if there is a stored deposit token for the user with this phone
        const fetchedToken = await this.dbMediator.fetchOne <DepositToken> ({phone: op.phone}, {collection: "deposit-tokens", db: "classyempireenterprise"});
        if (fetchedToken.success) {
            return {
                success: true,
                msg: "Deposit token retrieved",
                data: fetchedToken.data
            };
        }

        const tkn = generateRandomId();
        const token : DepositToken = {
            _id: tkn,
            token: tkn,
            phone: op.phone,
            date: new Date().toISOString(),
            amount: op.amount,
            confirmed: false
        }

        // save token and return the token
        await this.dbMediator.insertOne <DepositToken> (token, {collection: "deposit-tokens", db: "classyempireenterprise"});
        return {
            success: true,
            msg: "Deposit token created",
            data: token
        }
    }

    async hasEnoughBalance(op: {user: User | Admin, trxAmount: number}) : Promise<Feedback<any>> {

        // validate amount
        if (isNaN(op.trxAmount)) {
            return {
                success: false,
                msg: "Invalid amount"
            }
        }

        if (!op.user) {
            return {
                success: false,
                msg: "No user object"
            }
        }
        
        if (op.user.wallet.balance < op.trxAmount) {
            return {
                success: false,
                msg: "Insufficient balance"
            }
        } else {
            return {
                success: true,
                msg: "Balance enough"
            } 
        }
    }

    async chargeCustomer(op: {user: User | Admin, amount: number}) : Promise<Feedback<any>> {
        let isAdmin = false;
        // validate amount
        if (isNaN(op.amount)) {
            return {
                success: false,
                msg: "Invalid amount"
            }
        }

        if (!op.user) {
            return {
                success: false,
                msg: "No user object"
            }
        }

        const r = await this.dbMediator.updateOne <any> ({"info.phone": op.user.info.phone}, {$set: {
            'wallet.balance': op.user.wallet.balance - Number(op.amount)
        }}, {db: "classyempireenterprise", collection: op.user.hasOwnProperty('supremacy') ? "admins" : "users"})

        if (r.success) {
            return {
                msg: "Customer charged successfully",
                success: true
            }
        } else {
            return {
                msg: "Unable to charge wallet",
                success: false
            }
        }

    }

    async refundCustomer(op: {user: User | Admin, amount: number}) : Promise<Feedback<any>> {
        let isAdmin = false;
       // validate amount
       if (isNaN(op.amount)) {
             return {
                 success: false,
                 msg: "Invalid amount"
             }
        }

        if (!op.user) {
            return {
                success: false,
                msg: "No user object"
            }
        }

        const r = await this.dbMediator.updateOne <any> ({"info.phone": op.user.info.phone}, {$set: {
            'wallet.balance': op.user.wallet.balance + Number(op.amount)
        }}, {db: "classyempireenterprise", collection: isAdmin ? "admins" : "users"})

        if (r.success) {
            return {
                msg: "Customer charged successfully",
                success: true
            }
        } else {
            return {
                msg: "Unable to charge wallet",
                success: false
            }
        }
 
     }
}
