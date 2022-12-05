import { Controller, Get, Post, UseGuards, Request, Body, Delete, Query } from '@nestjs/common';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { AuthenticateGuard } from 'src/modules/shared/guards/authenticate/authenticate.guard';
import { DepositToken, Feedback, IMonnifyOnlinePayResponse, VerificationToken } from 'src/modules/shared/interfaces/main.interfaces';
import { AccountService } from 'src/modules/shared/services/account/account/account.service';
import { User } from 'src/modules/shared/services/create-user/create-user/create-user.service';
import { MonnifyService } from 'src/modules/shared/services/monnify/monnify.service';

@Controller('account')
export class AccountController {
    constructor(
        private accountService: AccountService,
    ) {}

    @UseGuards(AdminGuard)
    @Get('all-deposit-tokens')
    async retrieveDepositTokens(@Request() req : Request) : Promise<Feedback<DepositToken[]>> {
        return await this.accountService.getDepositTokens();
    } 
    
    @UseGuards(AdminGuard)
    @Get('customers-balance')
    async getCustomersWalletBalance() : Promise<Feedback<number>> {
        return await this.accountService.getCustomersBalance();
    }   

    @UseGuards(AdminGuard)
    @Post('fund-wallet-with-monnify')
    async funeWalletWithMonnify(@Body() payload: IMonnifyOnlinePayResponse, @Request() req : Request) : Promise<Feedback<any>> {

        return await this.accountService.confirmAndCompleteFunding(payload, (<User>req.headers['user']));
    }
    @UseGuards(AuthenticateGuard)
    @Get('deposit-token')
    async retrieveDepositToken(@Request() req : Request) : Promise<Feedback<DepositToken>> {
        return await this.accountService.getDepositToken({phone: (<Feedback<VerificationToken>>req.headers['auth-token']).data.phone});
    }

    @UseGuards(AuthenticateGuard)
    @Get('balance')
    async getOwnBalance(@Request() req : Request) : Promise<Feedback<number>> {
        return {
            success: true,
            msg: "Balance retrieved",
            data: (<User>req.headers['user']).wallet.balance
        }
    }

    @UseGuards(AuthenticateGuard)
    @Post('deposit-token')
    async createDepositToken(@Request() req : Request, @Body() payload: {amount: number}) : Promise<Feedback<DepositToken>> {
        if (isNaN(payload.amount)) {
            return {
                success: false,
                msg: "Amount invalid"
            }
        }
        
        return await this.accountService.createDepositToken({phone: (<Feedback<VerificationToken>>req.headers['auth-token']).data.phone, amount: payload.amount});
    }

    @UseGuards(AuthenticateGuard)
    @Delete('deposit-token')
    async deleteDepositToken(@Query('token') token : string) : Promise<Feedback<{amount: number, token: string}>> {
        return await this.accountService.deleteDepositToken({token: token});
    }

    @UseGuards(AdminGuard)
    @Post('confirm-deposit')
    async deposit(@Body() payload: {token: string}) : Promise<Feedback<{amount: number, token: string, confirmed: boolean}>> {
        return await this.accountService.confirmDeposit(payload);
    }    
    
    @UseGuards(AdminGuard)
    @Post('fund-customer-wallet')
    async fundCustomer(@Body() payload: {phone: string, amount: number}) : Promise<Feedback<any>> {
        return await this.accountService.fundCustomer(payload);
    }
}
