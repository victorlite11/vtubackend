import { Module } from '@nestjs/common';
import { SignupController } from './controllers/signup/signup.controller';
import { SigninController } from './controllers/signin/signin.controller';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [SignupController, SigninController],
  imports: [SharedModule]
})
export class AuthModule {}
