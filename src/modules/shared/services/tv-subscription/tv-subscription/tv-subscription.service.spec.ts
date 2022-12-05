import { Test, TestingModule } from '@nestjs/testing';
import { TvSubscriptionService } from './tv-subscription.service';

describe('TvSubscriptionService', () => {
  let service: TvSubscriptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TvSubscriptionService],
    }).compile();

    service = module.get<TvSubscriptionService>(TvSubscriptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
