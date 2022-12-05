import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { AuthenticateGuard } from 'src/modules/shared/guards/authenticate/authenticate.guard';
import { Feedback, Transaction, VerificationToken } from 'src/modules/shared/interfaces/main.interfaces';
import { AccountService } from 'src/modules/shared/services/account/account/account.service';
import { Admin } from 'src/modules/shared/services/admin/admin/admin.service';
import { User } from 'src/modules/shared/services/create-user/create-user/create-user.service';
import { DatawayService, IDatawayServiceCategory, DatawayServiceCategorySlug, IDatawayServiceVariation, IDatawayBillerValidationPayload, IDatawayPaymentPayload, IDatawayPaymentSuccessFeedback } from 'src/modules/shared/services/dataway/dataway.service';
import { TransactionsService } from 'src/modules/shared/services/transactions/transactions/transactions.service';

@Controller('dataway')
export class DatawayController {

    constructor(
        private datawayService: DatawayService,
        private accountService: AccountService,
        private transactionService: TransactionsService
    ) {}

    @UseGuards(AdminGuard)
    @Get('balance')
    async getWalletBalance() : Promise<Feedback<string>> {
        return await this.datawayService.getBalance();
    }
    
    @UseGuards(AdminGuard)
    @Get('query-transaction')
    async getTransactionDetail(@Query('reference') ref: string) : Promise<Feedback<IDatawayPaymentSuccessFeedback>> {
        return await this.datawayService.getTransactionDetails({ref: ref});
    }

    @UseGuards(AuthenticateGuard)
    @Get('get-service-categories')
    async getServiceCategories() : Promise<Feedback<IDatawayServiceCategory[]>> {
        return await this.datawayService.getServiceCategories();
    }

    @UseGuards(AuthenticateGuard)
    @Get('get-services')
    async getServices(@Query('slug') slug: DatawayServiceCategorySlug) : Promise<Feedback<DatawayService[]>> {
        return await this.datawayService.getServices({slug: slug});
    }

    @UseGuards(AuthenticateGuard)
    @Get('get-service-variations')
    async getServiceVariationsWi(@Query('service-slug') slug: string) : Promise<Feedback<IDatawayServiceVariation[]>> {
        return await this.datawayService.getServiceVariationsWithCommission({serviceSlug: slug});
    }

    @UseGuards(AuthenticateGuard)
    @Post('validate-biller')
    async validateBiller(@Body() payload: IDatawayBillerValidationPayload) : Promise<Feedback<any>> {
        return await this.datawayService.validateBiller(payload);
    }

    @UseGuards(AuthenticateGuard)
    @Post('vend')
    async pay(@Body() payload: IDatawayPaymentPayload, @Request() req : Request) : Promise<Feedback<any>> {
        return await this.datawayService.pay(payload, req.headers['user'])
    }

}
