import {
  Field,
  ID,
  ObjectType,
  Int,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Coordinate } from './coordinate.entity';
import { TableName } from 'src/common/constants/TableName';

@ObjectType()
@Entity(TableName.RIDES)
export class Ride {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.rides, { eager: true })
  @JoinColumn({ name: 'driver_id' })
  driver!: User;

  @Field(() => String)
  @RelationId((ride: Ride) => ride.driver)
  driverId!: string;

  @Field(() => GraphQLISODateTime)
  @Column({ type: 'timestamp' })
  departAt!: Date;

  @Field(() => Int)
  @Column()
  seatsTotal!: number;

  @Field(() => Int)
  @Column()
  seatsAvailable!: number;

  @Field(() => Int)
  @Column({ type: 'int' })
  pricePerSeatCents!: number;

  @Field(() => Coordinate)
  @Column({ type: 'jsonb' })
  origin!: Coordinate;

  @Field(() => Coordinate)
  @Column({ type: 'jsonb' })
  destination!: Coordinate;

  @Field(() => [Coordinate], { nullable: true })
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  route?: Coordinate[];
}
