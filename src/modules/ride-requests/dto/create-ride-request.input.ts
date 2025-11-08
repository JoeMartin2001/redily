import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateRideRequestInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
