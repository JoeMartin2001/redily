import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class RideRequest {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
