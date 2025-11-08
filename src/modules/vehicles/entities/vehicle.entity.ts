import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Vehicle {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
