import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const corsOptions: CorsOptions = {
    origin: ["http://localhost:4200","http://localhost:5555", "https://classyempireenterprise.com", "www.classyempireenterprise.com", "https://www.classyempireenterprise.com"],
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
  }
  const app = await NestFactory.create(AppModule, { cors: corsOptions});
  await app.listen(3000);
}
bootstrap();
