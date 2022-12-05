import { Test, TestingModule } from '@nestjs/testing';
import { NearlyfreeController } from './nearlyfree.controller';

describe('NearlyfreeController', () => {
  let controller: NearlyfreeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NearlyfreeController],
    }).compile();

    controller = module.get<NearlyfreeController>(NearlyfreeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
