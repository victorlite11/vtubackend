import { Test, TestingModule } from '@nestjs/testing';
import { DatawayController } from './dataway.controller';

describe('DatawayController', () => {
  let controller: DatawayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DatawayController],
    }).compile();

    controller = module.get<DatawayController>(DatawayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
