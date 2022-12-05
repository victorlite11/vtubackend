import { Module } from '@nestjs/common';
import { env } from './environment/environment';
import { AirtimeRechargeService } from './services/airtime-recharge/airtime-recharge/airtime-recharge.service';
import { DataSubscriptionService } from './services/data-subscription/data-subscription/data-subscription.service';
import { EducationPaymentService } from './services/education-payment/education-payment/education-payment.service';
import { ElectricityPaymentService } from './services/electricity-payment/electricity-payment/electricity-payment.service';
import { TvSubscriptionService } from './services/tv-subscription/tv-subscription/tv-subscription.service';
import { DbMediatorService } from './services/db-mediator/db-mediator/db-mediator.service';
import { UserService } from './services/create-user/create-user/create-user.service';
import { AccountService } from './services/account/account/account.service';
import { AdminService } from './services/admin/admin/admin.service';
import { TransactionsService } from './services/transactions/transactions/transactions.service';
import { DatawayService } from './services/dataway/dataway.service';
import { NearlyfreeService } from './services/nearlyfree/nearlyfree/nearlyfree.service';
import { MonnifyService } from './services/monnify/monnify.service';
import { CompService } from './services/comp/comp/comp.service';
import { NotificationService } from './services/notification/notification.service';

@Module({
    providers: [
        {provide: 'VTPASS_BASE_URL', useValue: env.vtpass.sandbox.API_BASE_URL},
        {provide: 'DATAWAY_BASE_URL', useValue: env.dataway.live.API_BASE_URL},
        {provide: 'NEARLYFREE_BASE_URL', useValue: env.nearlyfree.live.API_BASE_URL},
        {provide: 'MONNIFY_BASE_URL', useValue: env.monnify.live.API_BASE_URL},
        {provide: 'MONNIFY_API_SECRET_KEY', useValue: env.monnify.live.API_SECRET},
        {provide: 'MONNIFY_API_KEY', useValue: env.monnify.live.API_KEY},
        {provide: 'BVN', useValue: env.monnify.live.BVN},
        {provide: 'MONNIFY_DEFAULT_CONTRACT_CODE', useValue: env.monnify.live.DEFAULT_CONTRACT_CODE},
        AirtimeRechargeService,
        DataSubscriptionService,
        TvSubscriptionService,
        ElectricityPaymentService,
        EducationPaymentService,
        DbMediatorService,
        UserService,
        AccountService,
        AdminService,
        DatawayService,
        TransactionsService,
        NearlyfreeService,
        MonnifyService,
        CompService,
        NotificationService
    ],
    exports: [
        AirtimeRechargeService,
        DataSubscriptionService,
        TvSubscriptionService,
        ElectricityPaymentService,
        EducationPaymentService,
        UserService,
        CompService,
        NotificationService,
        MonnifyService,
        DatawayService,
        AccountService,
        AdminService,
        TransactionsService,
        NearlyfreeService
    ]
})
export class SharedModule {}
