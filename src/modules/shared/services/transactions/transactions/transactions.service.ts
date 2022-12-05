import { Injectable } from '@nestjs/common';
import { generateRandomId } from 'src/modules/shared/utils/main.utils';
import { Feedback, Transaction } from '../../../interfaces/main.interfaces';
import { DbMediatorService } from '../../db-mediator/db-mediator/db-mediator.service';

@Injectable()
export class TransactionsService {
    
    constructor(
        private dbMediator: DbMediatorService
    ) {}

    async getTransactions(arg0: { phone?: string; }): Promise<Feedback<Transaction[]>> {
        return await this.dbMediator.fetchAll <Transaction> (arg0.phone ? {phone: arg0.phone} : {}, {db: "classyempireenterprise", collection: "transactions"});
    }

    async saveTransaction(trx: Transaction) : Promise<Feedback<Transaction>> {
        trx._id = generateRandomId(9);
        return await this.dbMediator.insertOne <Transaction> (trx, {db: "classyempireenterprise", collection: "transactions"});
    }
}
