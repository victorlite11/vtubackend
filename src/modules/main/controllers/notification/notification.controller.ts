import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { Feedback, INotification } from 'src/modules/shared/interfaces/main.interfaces';
import { NotificationService } from 'src/modules/shared/services/notification/notification.service';

@Controller('notifications')
export class NotificationController {
    constructor(
        private notificationService : NotificationService
    ) {}

    @UseGuards(AdminGuard)
    @Post()
    async createNewNotification(@Body() payload : INotification) {
        return await this.notificationService.createNewNotification(payload);
    }

    @UseGuards(AdminGuard)
    @Put()
    async updateNotification(@Body() payload : INotification) {
        return await this.notificationService.updateNotification(payload)
    }

    @Delete(':id')
    async deleteNotification(@Param('id') id: string) {
        return await this.notificationService.deleteNotification(id)
    }

    @Get()
    async getNotifications() : Promise<Feedback<INotification[]>> {
        return await this.notificationService.getNotifications();
    }
}
