import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityPaymentController } from './electricity-payment.controller';

describe('ElectricityPaymentController', () => {
  let controller: ElectricityPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElectricityPaymentController],
    }).compile();

    controller = module.get<ElectricityPaymentController>(ElectricityPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
