import { } from "@nestjs/core";
import { Controller, Get, Post, Body } from '@nestjs/common';
import { IAirtimeRecharge } from 'src/modules/shared/interfaces/main.interfaces';
import { AirtimeRechargeService } from 'src/modules/shared/services/airtime-recharge/airtime-recharge/airtime-recharge.service';

@Controller('airtime-recharge')
export class AirtimeRechargeController {

    constructor(
        private airtimeRechargeService: AirtimeRechargeService
    ) {}

    @Post('recharge')
    async rechargeAirtime(@Body() payload: IAirtimeRecharge) : Promise<any> {
        return await this.airtimeRechargeService.recharge(payload);
    }
}

