import { Controller, Get, UseGuards, Request, Delete, Body } from '@nestjs/common';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { AuthenticateGuard } from 'src/modules/shared/guards/authenticate/authenticate.guard';
import { Feedback, VerificationToken } from 'src/modules/shared/interfaces/main.interfaces';
import { User, UserService } from 'src/modules/shared/services/create-user/create-user/create-user.service';

@Controller('users')
export class UserController {
    constructor(
        private userService: UserService
    ) {}

    @UseGuards(AdminGuard)
    @Get()
    async getUsers() : Promise<Feedback<User[]>> {
        return this.userService.getUsers().then(r => {
            return r;
        });
    }

    @UseGuards(AdminGuard)
    @Delete()
    async deleteUser(@Body() body : {phone: string}) : Promise<Feedback<any>> {
        return this.userService.deleteUser({phone: body.phone}).then(r => {
            return r;
        });
    }

    @UseGuards(AuthenticateGuard)
    @Get('user-profile')
    async getUserDetail(@Request() req: Request) : Promise<Feedback<User>> {
        return {
            msg: "Data retrieved",
            success: true,
            data: req.headers['user']
        };
    }
}
