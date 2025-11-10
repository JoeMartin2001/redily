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
  @Column({ type: 'varchar', length: 40 })
  phoneNumber!: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', length: 6 })
  code!: string;

  @Field(() => Date)
  @IsDateString()
  @IsNotEmpty()
  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  @Column({ type: 'int', default: 0 })
  attempts!: number;

  @Field()
  @Column({ type: 'timestamptz', default: new Date() })
  createdAt!: Date;

  @Field()
  @Column({ type: 'timestamptz', default: new Date() })
  updatedAt!: Date;
}
