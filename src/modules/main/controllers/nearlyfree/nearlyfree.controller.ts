import { Body, Controller, Get, Param, Post, Query, UseGuards, Request } from '@nestjs/common';
import { AuthenticateGuard } from 'src/modules/shared/guards/authenticate/authenticate.guard';
import { Feedback } from 'src/modules/shared/interfaces/main.interfaces';
import { AccountService } from 'src/modules/shared/services/account/account/account.service';
import { INearlyFreePurchasePayload, INearlyFreeServiceNetwork, INearlyFreeServicePlan, NearlyfreeService, NEARLYFREE_SERVICES } from 'src/modules/shared/services/nearlyfree/nearlyfree/nearlyfree.service';
import { TransactionsService } from 'src/modules/shared/services/transactions/transactions/transactions.service';

@Controller('nearlyfree')
export class NearlyfreeController {
    constructor(
        private nfService: NearlyfreeService,
        private accountService: AccountService,
        private transactionService: TransactionsService
    ) {}

    @Get('service/:service')
    async getServices(@Param('service') service : NEARLYFREE_SERVICES) : Promise<Feedback<INearlyFreeServiceNetwork>> {
        
        if (!service) {
            return {
                success: false,
                msg: "Please specify service category"
            }
        }

        return this.nfService.getServices({service: service}).then(r => {
            return r;
        });
    }

    @Get('plans')
    async getServicePlans(@Query('networkId') networkId : string) : Promise<Feedback<INearlyFreeServicePlan>> {
        console.log(networkId)
        return this.nfService.getServicePlans({networkId: networkId}).then(r => {
            return r;
        });
    }

    @UseGuards(AuthenticateGuard)
    @Post('purchase')
    async pay(@Body() payload: INearlyFreePurchasePayload, @Request() req : Request) : Promise<Feedback<any>> {
        return await this.accountService.hasEnoughBalance(
            {user: req.headers['user'], trxAmount: Number(payload.amount)}
            ).then(async r => {
            if (r.success) {
                // make transaction and return
                return await this.nfService.purchaseService({purchasePayload: payload, user: req.headers['user']})
            } else {
                return r;
            }
                
        })
        
    }
}
