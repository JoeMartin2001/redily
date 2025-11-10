import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class Coordinate {
  @Field(() => Float)
  lat!: number;

  @Field(() => Float)
  lng!: number;
}
