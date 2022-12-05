import { Test, TestingModule } from '@nestjs/testing';
import { DatawayService } from './dataway.service';

describe('DatawayService', () => {
  let service: DatawayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatawayService],
    }).compile();

    service = module.get<DatawayService>(DatawayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
