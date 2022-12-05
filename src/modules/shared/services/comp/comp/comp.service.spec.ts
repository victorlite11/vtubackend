import { Test, TestingModule } from '@nestjs/testing';
import { CompService } from './comp.service';

describe('CompService', () => {
  let service: CompService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompService],
    }).compile();

    service = module.get<CompService>(CompService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
