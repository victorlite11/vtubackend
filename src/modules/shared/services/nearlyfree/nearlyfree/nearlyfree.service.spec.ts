import { Test, TestingModule } from '@nestjs/testing';
import { NearlyfreeService } from './nearlyfree.service';

describe('NearlyfreeService', () => {
  let service: NearlyfreeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NearlyfreeService],
    }).compile();

    service = module.get<NearlyfreeService>(NearlyfreeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
