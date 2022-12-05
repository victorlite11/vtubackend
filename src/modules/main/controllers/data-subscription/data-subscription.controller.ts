import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IDataRecharge } from 'src/modules/shared/interfaces/main.interfaces';
import { DataSubscriptionService } from 'src/modules/shared/services/data-subscription/data-subscription/data-subscription.service';

@Controller('data-subscription')
export class DataSubscriptionController {

    constructor(
        private dataSubscriptionService: DataSubscriptionService
    ) {}

    @Get('variations')
    async getVariations(@Query('network') network: 'mtn-data' | 'glo-data' | 'airtel-data' | 'etisalat-data') : Promise<any> {
        return await this.dataSubscriptionService.getVariations(network);
    }

    @Post('recharge')
    async rechargeAirtime(@Body() payload: IDataRecharge) : Promise<any> {
        return await this.dataSubscriptionService.recharge(payload);
    }
}
