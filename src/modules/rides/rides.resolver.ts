import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RidesService } from './rides.service';
import { Ride } from './entities/ride.entity';
import { CreateRideInput } from './dto/create-ride.input';
import { UpdateRideInput } from './dto/update-ride.input';

@Resolver(() => Ride)
export class RidesResolver {
  constructor(private readonly ridesService: RidesService) {}

  @Mutation(() => Ride)
  createRide(@Args('createRideInput') createRideInput: CreateRideInput) {
    return this.ridesService.create(createRideInput);
  }

  @Query(() => [Ride], { name: 'rides' })
  findAll() {
    return this.ridesService.findAll();
  }

  @Query(() => Ride, { name: 'ride' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.ridesService.findOne(id);
  }

  @Mutation(() => Ride)
  updateRide(@Args('updateRideInput') updateRideInput: UpdateRideInput) {
    return this.ridesService.update(updateRideInput.id, updateRideInput);
  }

  @Mutation(() => Ride)
  removeRide(@Args('id', { type: () => Int }) id: number) {
    return this.ridesService.remove(id);
  }
}
