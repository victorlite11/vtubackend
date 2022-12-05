import { Test, TestingModule } from '@nestjs/testing';
import { TvSubscriptionController } from './tv-subscription.controller';

describe('TvSubscriptionController', () => {
  let controller: TvSubscriptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TvSubscriptionController],
    }).compile();

    controller = module.get<TvSubscriptionController>(TvSubscriptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
