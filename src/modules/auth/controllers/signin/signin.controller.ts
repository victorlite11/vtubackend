import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { AdminGuard } from 'src/modules/shared/guards/admin/admin.guard';
import { AuthenticateGuard } from 'src/modules/shared/guards/authenticate/authenticate.guard';
import { Feedback, SigninBody, VerificationToken } from 'src/modules/shared/interfaces/main.interfaces';
import { AdminService } from 'src/modules/shared/services/admin/admin/admin.service';
import { UserService } from 'src/modules/shared/services/create-user/create-user/create-user.service';

@Controller('signin')
export class SigninController {
    constructor(
        private userService: UserService,
        private adminService: AdminService
    ) {}

    @Post()
    async signin(@Body() signinBody: SigninBody) : Promise<Feedback <{token: string}>> {
        let resp = await this.userService.verifyUser(signinBody);

        if (!resp.success) {
            // Might be an admin
            const resp2 = await this.adminService.verifyAdmin(signinBody)
            
            if (resp2.success) {
                resp = resp2;
            }
        }

        return resp;
    }

    @UseGuards(AuthenticateGuard)
    @Post('user-logout')
    async signoutUser(@Request() req : Request) : Promise<Feedback <{token: string}>> {
        return await this.userService.signout({
            phone: (<Feedback<VerificationToken>>req.headers['auth-token']).data.phone || ""
        })
    }

    @UseGuards(AdminGuard)
    @Post('admin-logout')
    async signoutAdmin(@Request() req : Request) : Promise<Feedback <{token: string}>> {
        return await this.userService.signout({
            phone: (<Feedback<VerificationToken>>req.headers['auth-token']).data.phone || ""
        })
    }
}
