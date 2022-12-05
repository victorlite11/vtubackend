import { Test, TestingModule } from '@nestjs/testing';
import { EducationPaymentController } from './education-payment.controller';

describe('EducationPaymentController', () => {
  let controller: EducationPaymentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducationPaymentController],
    }).compile();

    controller = module.get<EducationPaymentController>(EducationPaymentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
