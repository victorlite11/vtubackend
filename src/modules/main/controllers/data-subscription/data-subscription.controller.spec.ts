import { Test, TestingModule } from '@nestjs/testing';
import { DataSubscriptionController } from './data-subscription.controller';

describe('DataSubscriptionController', () => {
  let controller: DataSubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataSubscriptionController],
    }).compile();

    controller = module.get<DataSubscriptionController>(DataSubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
