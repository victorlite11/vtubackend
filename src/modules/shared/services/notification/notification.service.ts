import { Injectable } from '@nestjs/common';
import { Feedback, INotification } from '../../interfaces/main.interfaces';
import { generateRandomId } from '../../utils/main.utils';
import { DbMediatorService } from '../db-mediator/db-mediator/db-mediator.service';

@Injectable()
export class NotificationService {
    
    constructor(
        private dbMediator: DbMediatorService
    ) {}

    async deleteNotification(id: string) : Promise<Feedback<any>> {
        console.log(id);
        return await this.dbMediator.deleteOne <INotification> (
            {_id : id},
            {db: "classyempireenterprise", collection: "notifications"}
        )
    }

    async getNotifications(): Promise<Feedback<INotification[]>> {
        return await this.dbMediator.fetchAll <INotification> (
            {},
            {db: "classyempireenterprise", collection: "notifications"}
        )
    }

    async createNewNotification(payload: INotification) : Promise<Feedback<any>> {
        payload._id = generateRandomId(5);

        const notification = await this.dbMediator.fetchOne <INotification> (
            {"target" : payload.target}, {collection: "notifications", db: "classyempireenterprise"}
        );

        if (notification.success) {
            return await this.updateNotification(payload);
        } else {
           return await this.dbMediator.insertOne <INotification> (payload, {
               db: "classyempireenterprise",
               collection: "notifications"
           })
        }
    }

    async updateNotification(payload: INotification) : Promise<Feedback<any>> {

        return await this.dbMediator.updateOne <INotification> (
            {_id : payload._id},
            {$set: {
                body: payload.body
            }},
            {db: "classyempireenterprise", collection: "notifications"}
        )
    }
}
