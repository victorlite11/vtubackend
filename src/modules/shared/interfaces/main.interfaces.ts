import { UserInfo } from "os";
import { isNumberObject } from "util/types";

export interface IAirtimeRecharge {
    phone: string,
    amount: number,
    serviceId: 'mtn' | 'glo' | 'airtel' | 'etisalat'
}

export interface IDataRecharge {
    phone: string;
    serviceID: 'mtn-data' | 'glo-data' | 'airtel-data' | 'etisalat-data';
    variation_code: string;
    amount ?: number;
    billersCode: string; // the phone number you wish to make the subscription on
}

export interface IDataVariation {
    variation_code: string, 
    name: string, 
    variation_amount: string, 
    fixedPrice: string
}

export interface ITVSubscriptionVariation extends IDataVariation {};
export interface ITVSubscription {
    serviceID: 'dstv' | 'gotv' | 'startimes';
    billersCode: string; // smartcard number
    variation_code: string;
    amount: number;
    phone: string; // phone number of the recipient 
}

export interface IElectricityPayment {
    billersCode: string; // metre number
    variation_code: 'prepaid' | 'postpaid'; // metre type
    amount: number;
    phone: string; // phone number of the recipient 
    serviceID: 'ikeja-electric' | 'eko-electric' | 'kano-electric' | 'portharcourt-electric' | 'jos-electric' | 'ibadan-electric' | 'kaduna-electric' | 'abuja-electric'
}

export interface IEducationPaymentVariation extends IDataVariation {};
export interface IEducationPayment {
    serviceID: 'waec' | 'waec-registration';
    variation_code: string;
    amount: number;
    phone: string; // phone number of the recipient 
}

// What services do you provide
export enum Services {
    DATA = "data", AIRTIME = "airtime", CABLE = "cable", ELECTRICITY = "electricity", EDUCATION = "education"
}

// Who is an admin - a user with more privilege

export interface IAdmin extends IUser {
    supremacy : AdminSupremacy
}

export enum AdminSupremacy {
    OVERALL = "overall", USERS = "users", USERS_DEPOSITS = "users-deposits", SERVICES_AND_USERS = "services-and-users", SERVICES = "services"
}
// Who is a user?
export interface IUser {
    _id ?: string;
    account : _UserAccount;
    info: _UserInfo;
    credential: _UserLoginCredential;
    wallet: _UserWallet;
    transactions: _UserTransaction[];
}

export interface _UserAccount {
    monnifyReservedAccountRef : string;
}

export interface _UserInfo {
    fullname: string;
    email: string;
    phone: string;
}

export interface _UserLoginCredential {
    password: string;
}

export interface _UserWallet {
    balance: number;
}

export class Transaction implements _UserTransaction {
    _id ?: string;
    date: string;
    service: string;
    amount: number;
    phone: string;
    recipient: string;
    reference: string;
}

export interface _UserTransaction {
    _id ?: string;
    date: string;
    service: string
    amount: number;
    phone: string;
    recipient: string;
    reference: string;
}

// Auth
export interface SignupBody extends _UserInfo {
    password: string;
}

export interface SigninBody extends _UserLoginCredential {
    phone: string;
}

export interface DepositToken extends VerificationToken {
    amount: number;
    confirmed: boolean;
}

export interface VerificationToken {
    phone: string;
    token: string;
    date: string;
    _id?: string;
}


// Feedback
export interface Feedback <T> {
    success : boolean;
    msg ?: string;
    data ?: T;
}

export interface IMonnifyOnlinePayResponse { paymentRef: any; amountPaid: any; transactionRef: any; transactionHash: any; }

export interface ICEE {
    _id ?: string,
    account : {
        commissionBal : number
    }
    settings: ICEESettings
}

export interface ICEESettings {
    commissionSetting: ICommissionSetting
}

export interface ICommissionSetting {
    datasubCharge : number;
    tvsubCharge : number;
}

export interface IMonnifyReservedAccount {
    "bankCode": string,
    "bankName": string,
    "accountNumber": string,
    "accountName": string
}

export interface INotification {
    _id ?: string;
    title ?: string;
    body : string;
    target : "dashboard" | "airtime" | "data" | "fund-wallet" | "tv" | "power" | "transaction"
}