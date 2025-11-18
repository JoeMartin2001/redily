import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { IRideRequest, RideRequestStatus } from 'src/common/interfaces';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TableName } from 'src/common/constants/TableName';

@ObjectType()
@Entity(TableName.RIDE_REQUESTS)
export class RideRequest implements Partial<IRideRequest> {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  rideId!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  userId!: string;

  @Field(() => RideRequestStatus)
  @Column({ type: 'enum', enum: RideRequestStatus })
  status!: RideRequestStatus;

  @Field(() => GraphQLISODateTime)
  @Column({ type: 'timestamptz', default: new Date() })
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Column({ type: 'timestamptz', default: new Date() })
  updatedAt!: Date;
}
