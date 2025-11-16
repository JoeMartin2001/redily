import {
  ObjectType,
  Field,
  ID,
  HideField,
  GraphQLISODateTime,
} from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
} from 'class-validator';
import {
  IUser,
  IUserAuthProvider,
  IUserType,
} from 'src/common/interfaces/User';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TableName } from 'src/common/constants/TableName';
import { Ride } from 'src/modules/rides/entities/ride.entity';

@ObjectType()
@Entity(TableName.USERS)
export class User implements IUser {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: true })
  firstName!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: true })
  lastName!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  @Column({ nullable: true })
  phoneNumber!: string;

  @Field()
  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  telegramId?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsDate()
  @IsOptional()
  @Column({ type: 'date', nullable: true })
  dateOfBirth!: Date | null;

  @Field()
  @IsEmail()
  @Column({ unique: true })
  email!: string;

  @HideField()
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'text', nullable: true })
  password!: string;

  @HideField()
  @IsString()
  @IsOptional()
  @Column({ nullable: true })
  googleId?: string;

  @Field()
  @Column({ default: IUserAuthProvider.LOCAL })
  authProvider!: IUserAuthProvider;

  @Field()
  @Column({ default: IUserType.DRIVER })
  type!: IUserType;

  @Field()
  @IsOptional()
  @Column({ default: '' })
  bio!: string;

  @Field()
  @IsOptional()
  @Column({ default: '' })
  avatarUrl!: string;

  @Field()
  @Column({ default: new Date() })
  createdAt!: Date;

  @Field()
  @Column({ default: new Date() })
  updatedAt!: Date;

  @Field()
  @Column({ default: '' })
  username!: string;

  @Field(() => Boolean)
  @IsBoolean()
  @Column({ type: 'boolean', default: false, nullable: false })
  emailVerified!: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @Column({ type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date | null;

  @Field(() => [Ride])
  @OneToMany(() => Ride, (ride) => ride.driver)
  rides: Ride[];
}
