import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './modules/shared/shared.module';
import { EducationPaymentController } from './modules/main/controllers/education-payment/education-payment.controller';
import { MainModule } from './modules/main/main.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [SharedModule, MainModule, AuthModule],
  controllers: [AppController, EducationPaymentController],
  providers: [AppService],
})
export class AppModule {}
