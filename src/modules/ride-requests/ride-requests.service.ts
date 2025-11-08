import { Injectable } from '@nestjs/common';
import { CreateRideRequestInput } from './dto/create-ride-request.input';
import { UpdateRideRequestInput } from './dto/update-ride-request.input';

@Injectable()
export class RideRequestsService {
  create(createRideRequestInput: CreateRideRequestInput) {
    return 'This action adds a new rideRequest';
  }

  findAll() {
    return `This action returns all rideRequests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} rideRequest`;
  }

  update(id: number, updateRideRequestInput: UpdateRideRequestInput) {
    return `This action updates a #${id} rideRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} rideRequest`;
  }
}
