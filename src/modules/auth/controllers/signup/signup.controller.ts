import { Body, Controller, Post } from '@nestjs/common';
import { Feedback, SignupBody } from 'src/modules/shared/interfaces/main.interfaces';
import { UserService } from 'src/modules/shared/services/create-user/create-user/create-user.service';

@Controller('signup')
export class SignupController {
    constructor(
        private userService: UserService
    ) {}
    @Post()
    async signup(@Body() signupBody: SignupBody) : Promise<Feedback<{phoneNumber: string}>> {
        signupBody = signupBody as SignupBody;
        return await this.userService.createUser(signupBody);
    }
}
