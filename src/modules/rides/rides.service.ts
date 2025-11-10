import { Injectable } from '@nestjs/common';
import { CreateRideInput } from './dto/create-ride.input';
import { UpdateRideInput } from './dto/update-ride.input';

@Injectable()
export class RidesService {
  create(createRideInput: CreateRideInput) {
    console.log(createRideInput);
    return 'This action adds a new ride';
  }

  findAll() {
    return `This action returns all rides`;
  }

  findOne(id: string) {
    return `This action returns ride ${id}`;
  }

  update(id: string, updateRideInput: UpdateRideInput) {
    console.log(updateRideInput);
    return `This action updates ride ${id}`;
  }

  remove(id: string) {
    return `This action removes ride ${id}`;
  }
}
