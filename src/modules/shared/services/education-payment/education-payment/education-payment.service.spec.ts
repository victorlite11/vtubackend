import { Test, TestingModule } from '@nestjs/testing';
import { EducationPaymentService } from './education-payment.service';

describe('EducationPaymentService', () => {
  let service: EducationPaymentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducationPaymentService],
    }).compile();

    service = module.get<EducationPaymentService>(EducationPaymentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
