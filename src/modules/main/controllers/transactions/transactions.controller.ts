import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { AuthenticateGuard } from 'src/modules/shared/guards/authenticate/authenticate.guard';
import { Feedback, Transaction, VerificationToken } from 'src/modules/shared/interfaces/main.interfaces';
import { TransactionsService } from 'src/modules/shared/services/transactions/transactions/transactions.service';

@Controller('transactions')
export class TransactionsController {

    constructor(
        private trxService: TransactionsService
    ) {}

    @UseGuards(AdminGuard)
    @Get() 
    async getAllTransactions(@Query('phone') phone: string) : Promise<Feedback<Transaction[]>> {
        if (phone) {
           return await this.trxService.getTransactions({phone: phone}); 
        } else {
          return await this.trxService.getTransactions({});  
        }
        
    }

    @UseGuards(AuthenticateGuard)
    @Get('self') 
    async getMyTransactions(@Request() req: Request) : Promise<Feedback<Transaction[]>> {
        return await this.trxService.getTransactions({
            phone: (<Feedback<VerificationToken>>req.headers['auth-token']).data.phone || ""
        })       
    }
}
