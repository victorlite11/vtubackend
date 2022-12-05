import { Body, Controller, Post } from '@nestjs/common';
import { IElectricityPayment } from 'src/modules/shared/interfaces/main.interfaces';
import { ElectricityPaymentService } from 'src/modules/shared/services/electricity-payment/electricity-payment/electricity-payment.service';

@Controller('electricity-payment')
export class ElectricityPaymentController {

    constructor(
        private electricityPaymentService: ElectricityPaymentService
    ) {}

    @Post('recharge')
    async recharge(@Body() payload: IElectricityPayment) : Promise<any> {
        return await this.electricityPaymentService.recharge(payload);
    }

    @Post('validate')
    async validate(@Body() payload: {serviceID: string, billersCode: string, type: 'prepaid' | 'postpaid'}) : Promise<any> {
        return await this.electricityPaymentService.validateMetreNumber(payload);
    }
}
