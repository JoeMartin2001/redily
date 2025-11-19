import { ObjectType, Field, Float } from '@nestjs/graphql';
import { TableName } from 'src/common/constants/TableName';
import { Entity } from 'typeorm';

@ObjectType()
@Entity(TableName.COORDINATES)
export class Coordinate {
  @Field(() => Float)
  lat!: number;

  @Field(() => Float)
  lng!: number;
}
