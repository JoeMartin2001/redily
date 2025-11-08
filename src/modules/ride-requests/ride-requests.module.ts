import { Module } from '@nestjs/common';
import { RideRequestsService } from './ride-requests.service';
import { RideRequestsResolver } from './ride-requests.resolver';

@Module({
  providers: [RideRequestsResolver, RideRequestsService],
})
export class RideRequestsModule {}
