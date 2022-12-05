import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { IEducationPayment } from 'src/modules/shared/interfaces/main.interfaces';
import { EducationPaymentService } from 'src/modules/shared/services/education-payment/education-payment/education-payment.service';

@Controller('education-payment')
export class EducationPaymentController {
    constructor(
        private educationPaymentService: EducationPaymentService
    ) {}

    @Get('variations')
    async getVariations(@Query('serviceID') serviceId: 'waec' | 'waec-registration') : Promise<any> {
        return await this.educationPaymentService.getVariations(serviceId);
    }

    @Post('recharge')
    async rechargeAirtime(@Body() payload: IEducationPayment) : Promise<any> {
        return await this.educationPaymentService.recharge(payload);
    }
}
