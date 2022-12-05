import { Test, TestingModule } from '@nestjs/testing';
import { DbMediatorService } from './db-mediator.service';

describe('DbMediatorService', () => {
  let service: DbMediatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DbMediatorService],
    }).compile();

    service = module.get<DbMediatorService>(DbMediatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
