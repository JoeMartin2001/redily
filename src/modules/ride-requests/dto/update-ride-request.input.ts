import { CreateRideRequestInput } from './create-ride-request.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRideRequestInput extends PartialType(CreateRideRequestInput) {
  @Field(() => Int)
  id: number;
}
