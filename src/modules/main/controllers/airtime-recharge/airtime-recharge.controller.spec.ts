import { Test, TestingModule } from '@nestjs/testing';
import { AirtimeRechargeController } from './airtime-recharge.controller';

describe('AirtimeRechargeController', () => {
  let controller: AirtimeRechargeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AirtimeRechargeController],
    }).compile();

    controller = module.get<AirtimeRechargeController>(AirtimeRechargeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
