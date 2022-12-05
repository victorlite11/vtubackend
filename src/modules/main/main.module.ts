import { Module } from '@nestjs/common';
import { SharedModule } from '../shared/shared.module';
import { AirtimeRechargeController } from './controllers/airtime-recharge/airtime-recharge.controller';
import { DataSubscriptionController } from './controllers/data-subscription/data-subscription.controller';
import { TvSubscriptionController } from './controllers/tv-subscription/tv-subscription.controller';
import { ElectricityPaymentController } from './controllers/electricity-payment/electricity-payment.controller';
import { AccountController } from './controllers/account/account.controller';
import { AdminController } from './controllers/admin/admin.controller';
import { UserController } from './controllers/user/user.controller';
import { TransactionsController } from './controllers/transactions/transactions.controller';
import { DatawayController } from './controllers/dataway/dataway.controller';
import { NearlyfreeController } from './controllers/nearlyfree/nearlyfree.controller';
import { MonnifyController } from './controllers/monnify/monnify.controller';
import { NotificationController } from './controllers/notification/notification.controller';

@Module({
    controllers: [AirtimeRechargeController, DataSubscriptionController, TvSubscriptionController, ElectricityPaymentController, AccountController, AdminController, UserController, TransactionsController, DatawayController, NearlyfreeController, MonnifyController, NotificationController],
    imports: [SharedModule]
})
export class MainModule {}
