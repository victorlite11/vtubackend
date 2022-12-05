import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { SignupBody, Feedback, ICEE, ICEESettings } from 'src/modules/shared/interfaces/main.interfaces';
import { AdminService } from 'src/modules/shared/services/admin/admin/admin.service';
import { CompService } from 'src/modules/shared/services/comp/comp/comp.service';

@Controller('admin')
export class AdminController {
    constructor(
        private adminService: AdminService,
        private ceeService : CompService
    ) {}
    
    @UseGuards(AdminGuard)
    @Post('new')
    async newAdmin(@Body() signupBody: SignupBody) : Promise<Feedback<{phoneNumber: string}>> {
        signupBody = signupBody as SignupBody;
        return await this.adminService.createAdmin(signupBody);
    }    
    
    @UseGuards(AdminGuard)
    @Post('withdraw-commission')
    async withdrawCommission(@Body() payload: {amount : number}) : Promise<Feedback<ICEE>> {
        return await this.ceeService.withdrawCommission(payload);
    }

    @UseGuards(AdminGuard)
    @Get('cee')
    async getCEEData() : Promise<Feedback<ICEE>> {
        let cee = await this.ceeService.getCEE()
        return cee;
    }

    @UseGuards(AdminGuard)
    @Get('cee-settings')
    async getCEESettings() : Promise<Feedback<ICEESettings>> {
        let cee = await this.ceeService.getCEE()

        if (cee.success) {
            return {
                success: true,
                data: cee.data.settings
            }
        } else {
            return {
                success: false,
                msg: cee.msg
            }
        }
    }

    @UseGuards(AdminGuard)
    @Put('cee')
    async updateCEEData(@Body() payload: ICEESettings) : Promise<Feedback<any>> {
        return await this.ceeService.updateCEESettings(payload).then(r => {
            if (r.success) {
                return {
                    ...r,
                    msg: "Settings updated successfully"
                }
            } else {
                return r;
            }
        })
    }
}
