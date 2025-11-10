import {
  InputType,
  Int,
  Field,
  Float,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import { Coordinate } from '../entities/coordinate.entity';

@InputType()
export class CoordinateInput implements Pick<Coordinate, 'lat' | 'lng'> {
  @Field(() => Float)
  lat!: number;

  @Field(() => Float)
  lng!: number;
}

@InputType()
export class CreateRideInput {
  @Field(() => String)
  driverId!: string;

  @Field(() => GraphQLISODateTime)
  departAt!: Date;

  @Field(() => Int)
  seatsTotal!: number;

  @Field(() => Int)
  seatsAvailable!: number;

  @Field(() => Int)
  pricePerSeatCents!: number;

  @Field(() => CoordinateInput)
  origin!: CoordinateInput;

  @Field(() => CoordinateInput)
  destination!: CoordinateInput;

  @Field(() => [CoordinateInput], { nullable: true })
  route?: CoordinateInput[];
}
