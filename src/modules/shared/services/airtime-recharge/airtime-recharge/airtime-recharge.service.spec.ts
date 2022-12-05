import { Test, TestingModule } from '@nestjs/testing';
import { AirtimeRechargeService } from './airtime-recharge.service';

describe('AirtimeRechargeService', () => {
  let service: AirtimeRechargeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AirtimeRechargeService],
    }).compile();

    service = module.get<AirtimeRechargeService>(AirtimeRechargeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
