import { CreateRideInput } from './create-ride.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateRideInput extends PartialType(CreateRideInput) {
  @Field(() => String)
  id!: string;
}
