import { Test, TestingModule } from '@nestjs/testing';
import { RideRequestsResolver } from './ride-requests.resolver';
import { RideRequestsService } from './ride-requests.service';

describe('RideRequestsResolver', () => {
  let resolver: RideRequestsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RideRequestsResolver, RideRequestsService],
    }).compile();

    resolver = module.get<RideRequestsResolver>(RideRequestsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
