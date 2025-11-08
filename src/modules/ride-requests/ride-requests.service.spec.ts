import { Test, TestingModule } from '@nestjs/testing';
import { RideRequestsService } from './ride-requests.service';

describe('RideRequestsService', () => {
  let service: RideRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RideRequestsService],
    }).compile();

    service = module.get<RideRequestsService>(RideRequestsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
