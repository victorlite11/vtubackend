import { Injectable } from '@nestjs/common';
import { AdminSupremacy, Feedback, IAdmin, SigninBody, SignupBody, VerificationToken, _UserAccount, _UserInfo, _UserLoginCredential, _UserTransaction, _UserWallet } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId } from 'src/modules/shared/utils/main.utils';
import { DbMediatorService } from '../../db-mediator/db-mediator/db-mediator.service';
import { TransactionsService } from '../../transactions/transactions/transactions.service';

export class Admin implements IAdmin {
    account: _UserAccount;
    _id? = generateRandomId(10);
    supremacy = AdminSupremacy.OVERALL;
    info: _UserInfo;
    credential: _UserLoginCredential;
    wallet: _UserWallet = {balance: 0};
    transactions: _UserTransaction[] = [];
}

@Injectable()
export class AdminService {
    
    constructor(
        private dbMediator: DbMediatorService,
        private trxService: TransactionsService
    ) {}

    async getAdminWithEmail(op: {email: string}) : Promise<Feedback<Admin>> {
        return await this.dbMediator.fetchOne <Admin> ({"info.email": op.email}, {collection: "admins", db: "classyempireenterprise"}).then(async r => {
            if (r.success) {
                r.data.credential.password = "";
                if (r.data.info.phone) {
                    r.data.transactions = await (await this.trxService.getTransactions({phone: r.data.info.phone})).data
                }
            }
            return r;
        });
    }

    async getAdmin(op: {phone: string}) : Promise<Feedback<Admin>> {
        return await this.dbMediator.fetchOne <Admin> ({"info.phone": op.phone}, {collection: "admins", db: "classyempireenterprise"}).then(async r => {
            if (r.success) {
                r.data.credential.password = "";
                if (r.data.info.phone) {
                    r.data.transactions = await (await this.trxService.getTransactions({phone: r.data.info.phone})).data
                }
            }
            return r;
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

    async verifyAdmin(signinBody: SigninBody): Promise<Feedback<{ token: string; }> | PromiseLike<Feedback<{ token: string; }>>> {
        const fetchedAdmin = await this.dbMediator.fetchOne <Admin> ({"info.phone": signinBody.phone, "credential.password": signinBody.password}, {db: "classyempireenterprise", collection: "admins"});
        if (fetchedAdmin?.success) {
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
                msg: "Admin verified",
                data: {token: token.token}
            }
        } else {
            return {
                success: false,
                msg: "Admin not verified"
            }
        }
    }

    async createAdmin(signupBody: SignupBody) : Promise<Feedback<{phoneNumber: string, supremacy: AdminSupremacy, email: string}>> {
        if (!signupBody.fullname || !signupBody.phone || !signupBody.password) {
            return {
                success: false,
                msg: "Missing fields"
            }
        }

        if (!signupBody.email) {
            signupBody.email = `${signupBody.phone}@cee.com`
        }

        // check if user with same credentials already exists
        const fetchedAdmin = await this.dbMediator.fetchOne <Admin> ({$or: [{"info.phone": signupBody.phone},{"info.email": signupBody.email}]}, {db: "classyempireenterprise", collection: "admins"});
        if (fetchedAdmin?.success) {
            return {
                success: false,
                msg: "Credentials already used by another admin"
            }
        }

        // create user
        const admin = new Admin();
        admin.info = {email: signupBody.email, phone: signupBody.phone, fullname: signupBody.fullname}
        admin.credential = {password: signupBody.password}
        admin.account = {monnifyReservedAccountRef: ""}

        return await this.dbMediator.insertOne <Admin> (admin, {collection: "admins", db: "classyempireenterprise"}).then(r => {
            if(r?.success) {
                return {
                    success: true,
                    msg: "New admin created",
                    data: {phoneNumber: admin.info.phone, supremacy: admin.supremacy, email: admin.info.email}
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
