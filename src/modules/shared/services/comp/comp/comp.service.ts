import { Injectable } from '@nestjs/common';
import { Feedback, ICEE, ICEESettings } from 'src/modules/shared/interfaces/main.interfaces';
import { generateRandomId } from 'src/modules/shared/utils/main.utils';
import { DbMediatorService } from '../../db-mediator/db-mediator/db-mediator.service';

@Injectable()
export class CompService {

    constructor(
        private dbMediator : DbMediatorService
    ) {}

    async withdrawCommission(payload: {amount: number}): Promise<Feedback<ICEE>> {
        const r = await this.getCEE()
        if (r.success) {
            if (r.data.account.commissionBal < payload.amount) {
                return {
                    success: false,
                    msg: "Insufficient commission balance"
                }
            }

            return await this.dbMediator.updateOne <ICEE> ({}, {
                $set: {
                    "account.commissionBal" : r.data.account.commissionBal - payload.amount
                }}, {collection: "cee", db: "classyempireenterprise"}).then(r => {
                    if (r.success) {
                        return {
                            success: true,
                            msg: "Commission withdrawn successfully"
                        }
                    } else {
                        return {
                            success : false,
                            msg: "Unable to withdraw commission"
                        }
                    }
                })
        } else {
            return {
                success: false,
                msg: "Unable to withdraw commission"
            }
        }
    }

    async getCEE() : Promise<Feedback<ICEE>> {
        const r = await this.dbMediator.fetchOne <ICEE> ({}, {collection: "cee", db: "classyempireenterprise"})
        if (r.success) {
            return r;
        }

        // does not exist yet
        const cee : ICEE = {
            _id : generateRandomId(),
            account : {
                commissionBal: 0
            },
            settings: {
                commissionSetting: {
                    datasubCharge : 1,
                    tvsubCharge : 1
                }
            }
        }

        await this.dbMediator.insertOne <ICEE> (cee, {collection: "cee", db: "classyempireenterprise"});
        return {
            success: true,
            msg: "CEE data retrieved successfully",
            data: cee
        }
    }

    async updateCEESettings(payload : ICEESettings) : Promise<Feedback<any>> {
        return await this.dbMediator.updateOne <ICEE> (
            {}, {
                $set: {"settings": payload}
            },
            {collection: "cee", db: "classyempireenterprise"}
        )
    }

    async plusCommissionBal() : Promise<Feedback<any>> {
        const r = await this.getCEE()

        if (r.success) {
            return await this.dbMediator.updateOne <ICEE> (
                {}, {
                    $set: {"account.commissionBal": Number(r.data.account.commissionBal) + Number(r.data.settings.commissionSetting.datasubCharge)}
                },
                {collection: "cee", db: "classyempireenterprise"}
            )
        } else {
            return {
                success: false,
                msg: "Unable to add amount to commission balance"
            }
        }
    }
}
