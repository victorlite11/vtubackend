import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthenticateGuard } from 'src/modules/shared/guards/authenticate/authenticate.guard';
import { ICustomerReservedAccountPayload, MonnifyService } from 'src/modules/shared/services/monnify/monnify.service';

@Controller('monnify')
export class MonnifyController {

    constructor(
        private monnifyService : MonnifyService
    ) {}

    @UseGuards(AuthenticateGuard)
    @Post('reserved-accounts')
    async createReservedAccount(@Body() payload : {}, @Request() req : Request) {
        return await this.monnifyService.createReservedAccounts(req.headers['user']);
    }

    @Post('transaction-complete')
    async processTransactionCompletion(@Body() payload : any, @Request() req : Request) {
        return await this.monnifyService.processPaymentCompletion(payload);
    }

    @UseGuards(AuthenticateGuard)
    @Get('reserved-accounts')
    async getReservedAccount(@Request() req : Request) {
        return await this.monnifyService.getReservedAccounts(req.headers['user']);
    }

}
