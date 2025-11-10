// src/modules/user/dto/create-user.input.ts
import { InputType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  IsUrl,
  IsBoolean,
  IsDate,
} from 'class-validator';
import {
  IUserAuthProvider,
  IUser,
  IUserType,
} from 'src/common/interfaces/User';

@InputType()
export class CreateUserInput implements Partial<IUser> {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsString()
  @MinLength(3)
  username!: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  dateOfBirth?: Date | null;

  // Optional: for OAuth-created users you can omit password
  @Field(() => String, { nullable: true })
  @IsString()
  @MinLength(6)
  password!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  // Admin/server-controlled knobs (optional)
  @Field(() => IUserType, { nullable: true })
  @IsOptional()
  @IsEnum(IUserType)
  type?: IUserType;

  @Field(() => IUserAuthProvider, { nullable: true })
  @IsOptional()
  @IsEnum(IUserAuthProvider)
  authProvider?: IUserAuthProvider;

  @Field(() => String, {
    nullable: true,
    description: 'Google account ID if linking',
  })
  @IsOptional()
  @IsString()
  googleId?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  emailVerifiedAt?: Date | null;
}
