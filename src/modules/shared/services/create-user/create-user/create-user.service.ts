import { Injectable } from '@nestjs/common';
import { Feedback, SignupBody, IUser, _UserInfo, _UserLoginCredential, _UserTransaction, _UserWallet, SigninBody, VerificationToken, _UserAccount } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId } from 'src/modules/shared/utils/main.utils';
import { AdminService } from '../../admin/admin/admin.service';
import { DbLookupData, DbMediatorService } from '../../db-mediator/db-mediator/db-mediator.service';
import { TransactionsService } from '../../transactions/transactions/transactions.service';

export class User implements IUser {
    account: _UserAccount;
    _id? = generateRandomId(10);
    info: _UserInfo;
    credential: _UserLoginCredential;
    wallet: _UserWallet = {balance: 0};
    transactions: _UserTransaction[] = [];
}

@Injectable()
export class UserService {

    constructor(
        private dbMediator: DbMediatorService,
        private adminService: AdminService,
        private trxService: TransactionsService
    ) {}

    async signout(arg0: {
        phone: string; // admins and users uses same dashboard and routes from frontend
    }): Promise<Feedback<{ token: string; }>> {
        return await this.dbMediator.deleteOne <VerificationToken> ({
            phone: arg0.phone
        }, {db: "classyempireenterprise", collection: "verification_tokens"})
    }

    async getUsers(): Promise<Feedback<User[]>> {
        return this.dbMediator.fetchAll <User> ({}, {db: "classyempireenterprise", collection: "users"}).then(r => {
            return r;
        })
    }

    async deleteUser(arg0: { phone: string; }): Promise<Feedback<any>> {
        return await this.dbMediator.deleteOne <User> ({"info.phone": arg0.phone}, {db: "classyempireenterprise", collection: "users"});
    }

    async getUserWithEmail(op: {email: string}) : Promise<Feedback<User>> {
        return await this.dbMediator.fetchOne <User> ({"info.email": op.email}, {collection: "users", db: "classyempireenterprise"}).then(async r => {
            if (!r?.success) {
                // Maybe an admin. This block is implemented because
                // admins and users uses same dashboard and routes from frontend
                return await this.adminService.getAdminWithEmail({email: op.email}).then(async r => {
                    if (r.success) {
                        r.data.credential.password = "";
                        if (r.data.info.phone) {
                            r.data.transactions = await (await this.trxService.getTransactions({phone: r.data.info.phone})).data
                        }
                    }
                    return r;
                });
            } else {
                if (r.success) {
                    r.data.credential.password = "";
                    if (r.data.info.phone) {
                        r.data.transactions = await (await this.trxService.getTransactions({phone: r.data.info.phone})).data
                    }
                }
                return r;
            }
        });
    }

    async getUser(op: {phone: string}) : Promise<Feedback<User>> {
        return await this.dbMediator.fetchOne <User> ({"info.phone": op.phone}, {collection: "users", db: "classyempireenterprise"}).then(async r => {
            if (!r?.success) {
                // Maybe an admin. This block is implemented because
                // admins and users uses same dashboard and routes from frontend
                return await this.adminService.getAdmin({phone: op.phone}).then(async r => {
                    if (r.success) {
                        r.data.credential.password = "";
                        if (r.data.info.phone) {
                            r.data.transactions = await (await this.trxService.getTransactions({phone: r.data.info.phone})).data
                        }
                    }
                    return r;
                });
            } else {
                if (r.success) {
                    r.data.credential.password = "";
                    if (r.data.info.phone) {
                        r.data.transactions = await (await this.trxService.getTransactions({phone: r.data.info.phone})).data
                    }
                }
                return r;
            }
        });
    }

    async verifyToken(op: {token: string}) : Promise<Feedback<VerificationToken>> {
        const fetchedToken = await this.dbMediator.fetchOne <VerificationToken> ({token: op.token}, {db: "classyempireenterprise", collection: "verification_tokens"});
        if (fetchedToken?.success) {
            return {
                success: true,
                msg: "Token verified",
                data: fetchedToken.data
            }
        } else {
            return {
                success: false,
                msg: "Token not verified"
            }
        } 
    }

    async verifyUser(signinBody: SigninBody): Promise<Feedback<{ token: string; }> | PromiseLike<Feedback<{ token: string; }>>> {
        const fetchedUser = await this.dbMediator.fetchOne <User> ({"info.phone": signinBody.phone, "credential.password": signinBody.password}, {db: "classyempireenterprise", collection: "users"});
        if (fetchedUser?.success) {
            let token : VerificationToken;
            const fetchedToken = await this.dbMediator.fetchOne <VerificationToken> ({phone: signinBody.phone}, {db: "classyempireenterprise", collection: "verification_tokens"});
            
            if (!fetchedToken?.success) {
                // create and save new verification token for this user if no token has been created already
                token = {
                    phone: signinBody.phone,
                    token: generateRandomId(),
                    date: new Date().toISOString()
                }
                
                await this.dbMediator.insertOne <VerificationToken> (token, {db: "classyempireenterprise", collection: "verification_tokens"});
            } else {
                token = fetchedToken.data
            }

            return {
                success: true,
                msg: "Customer verified",
                data: {token: token.token}
            }
        } else {
            return {
                success: false,
                msg: "Customer not verified"
            }
        }
    }

    async createUser(signupBody: SignupBody) : Promise<Feedback<{phoneNumber: string, email: string}>> {
        if (!signupBody.fullname || !signupBody.phone || !signupBody.password) {
            return {
                success: false,
                msg: "Missing fields"
            }
        }

        const phonePrefix = ["080","081", "070", "090", "091"];
        
        if(!phonePrefix.includes(signupBody.phone.slice(0,3)) || !signupBody.phone.match(/\d{11}/)) {
            return {
                success: false,
                msg: "Phone number not valid"
            }
        }

        if (!signupBody.email) {
            signupBody.email = `${signupBody.phone}@cee.com`
        }

        // check if user with same credentials already exists
        const fetchedUser = await this.dbMediator.fetchOne <User> ({$or: [{"info.phone": signupBody.phone},{"info.email": signupBody.email}]}, {db: "classyempireenterprise", collection: "users"});
        if (fetchedUser?.success) {
            return {
                success: false,
                msg: "Credentials already used by another user"
            }
        }

        // create user
        const user = new User();
        user.info = {email: signupBody.email, phone: signupBody.phone, fullname: signupBody.fullname}
        user.credential = {password: signupBody.password}
        user.account = {monnifyReservedAccountRef: ""}

        return await this.dbMediator.insertOne <User> (user, {collection: "users", db: "classyempireenterprise"}).then(r => {
            if(r?.success) {
                return {
                    success: true,
                    msg: "Signup successful",
                    data: {phoneNumber: user.info.phone, email: user.info.email}
                }
            } else {
                return {
                    success: false,
                    msg: "Unable to create user"
                }
            }
        })
    }
}
