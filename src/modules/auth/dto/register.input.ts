import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { IUser } from 'src/common/interfaces/User';

@InputType()
export class RegisterInput implements Partial<IUser> {
  @Field(() => String)
  @IsEmail()
  email!: string;

  @Field(() => String)
  @IsString()
  @MinLength(3)
  username!: string;

  @Field(() => String)
  @IsString()
  @MinLength(6)
  password!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
