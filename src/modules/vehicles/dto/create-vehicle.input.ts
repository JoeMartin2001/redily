import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateVehicleInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
