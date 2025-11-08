import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Ride {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
