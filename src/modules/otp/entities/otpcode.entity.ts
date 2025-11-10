import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { OTPCode } from '../../../common/interfaces';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { Field, ID } from '@nestjs/graphql';

@Entity()
export class OTPCodeEntity implements OTPCode {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @IsString()
  @IsPhoneNumber('UZ')
  @IsNotEmpty()
  phoneNumber!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  code!: string;

  @Field(() => Date)
  @IsDateString()
  @IsNotEmpty()
  expiresAt!: Date;

  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  attempts!: number;

  @Field()
  @Column({ type: 'timestamptz', default: new Date() })
  createdAt!: Date;

  @Field()
  @Column({ type: 'timestamptz', default: new Date() })
  updatedAt!: Date;
}
