import { Test, TestingModule } from '@nestjs/testing';
import { ElectricityPaymentService } from './electricity-payment.service';

describe('ElectricityPaymentService', () => {
  let service: ElectricityPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElectricityPaymentService],
    }).compile();

    service = module.get<ElectricityPaymentService>(ElectricityPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
