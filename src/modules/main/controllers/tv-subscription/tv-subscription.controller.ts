import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ITVSubscription } from 'src/modules/shared/interfaces/main.interfaces';
import { TvSubscriptionService } from 'src/modules/shared/services/tv-subscription/tv-subscription/tv-subscription.service';

@Controller('tv-subscription')
export class TvSubscriptionController {
    constructor(
        private tvSubscriptionService: TvSubscriptionService
    ) {}

    @Get('variations')
    async getVariations(@Query('network') network: 'dstv' | 'gotv' | 'startimes') : Promise<any> {
        return await this.tvSubscriptionService.getVariations(network);
    }

    @Post('recharge')
    async recharge(@Body() payload: ITVSubscription) : Promise<any> {
        return await this.tvSubscriptionService.recharge(payload);
    }

    @Post('validate')
    async validate(@Body() payload: {serviceID: string, billersCode: string}) : Promise<any> {
        return await this.tvSubscriptionService.validateSmartCardNumber(payload);
    }
}
