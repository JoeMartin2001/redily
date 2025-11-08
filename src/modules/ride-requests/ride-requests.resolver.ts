import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { RideRequestsService } from './ride-requests.service';
import { RideRequest } from './entities/ride-request.entity';
import { CreateRideRequestInput } from './dto/create-ride-request.input';
import { UpdateRideRequestInput } from './dto/update-ride-request.input';

@Resolver(() => RideRequest)
export class RideRequestsResolver {
  constructor(private readonly rideRequestsService: RideRequestsService) {}

  @Mutation(() => RideRequest)
  createRideRequest(@Args('createRideRequestInput') createRideRequestInput: CreateRideRequestInput) {
    return this.rideRequestsService.create(createRideRequestInput);
  }

  @Query(() => [RideRequest], { name: 'rideRequests' })
  findAll() {
    return this.rideRequestsService.findAll();
  }

  @Query(() => RideRequest, { name: 'rideRequest' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.rideRequestsService.findOne(id);
  }

  @Mutation(() => RideRequest)
  updateRideRequest(@Args('updateRideRequestInput') updateRideRequestInput: UpdateRideRequestInput) {
    return this.rideRequestsService.update(updateRideRequestInput.id, updateRideRequestInput);
  }

  @Mutation(() => RideRequest)
  removeRideRequest(@Args('id', { type: () => Int }) id: number) {
    return this.rideRequestsService.remove(id);
  }
}
