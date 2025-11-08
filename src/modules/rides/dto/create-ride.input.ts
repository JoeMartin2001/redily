import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateRideInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
