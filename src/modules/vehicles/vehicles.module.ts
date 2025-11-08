import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { VehiclesResolver } from './vehicles.resolver';

@Module({
  providers: [VehiclesResolver, VehiclesService],
})
export class VehiclesModule {}
