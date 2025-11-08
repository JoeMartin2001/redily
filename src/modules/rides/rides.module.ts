import { Module } from '@nestjs/common';
import { RidesService } from './rides.service';
import { RidesResolver } from './rides.resolver';

@Module({
  providers: [RidesResolver, RidesService],
})
export class RidesModule {}
