import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Booking {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
