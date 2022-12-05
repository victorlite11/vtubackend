import { Test, TestingModule } from '@nestjs/testing';
import { DataSubscriptionService } from './data-subscription.service';

describe('DataSubscriptionService', () => {
  let service: DataSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataSubscriptionService],
    }).compile();

    service = module.get<DataSubscriptionService>(DataSubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
