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
} from 'class-validator';
import {
  IUser,
  IUserAuthProvider,
  IUserRole,
  LanguageLevel,
} from 'src/interfaces/User';
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
  @Column({ default: IUserRole.STUDENT })
  role!: IUserRole;

  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  languagesLearning!: string[];

  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  languagesTeaching!: string[];

  @Field(() => Boolean)
  @Column({ default: false })
  isStudent!: boolean;

  @Field(() => LanguageLevel)
  @Column({ default: LanguageLevel.A1 })
  level!: LanguageLevel;

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

  @Field()
  @Column({ default: '' })
  nativeLanguage!: string;

  @Field()
  @Column({ default: '' })
  targetLanguage!: string;

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
