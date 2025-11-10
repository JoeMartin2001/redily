import { Field } from '@nestjs/graphql';
import { ObjectType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';
import { IsNotEmpty } from 'class-validator';
import { User } from 'src/modules/user/entities/user.entity';

@ObjectType()
export class Auth {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @Field({ nullable: true })
  @IsString()
  @IsNotEmpty()
  refreshToken?: string;

  @Field(() => User)
  @IsOptional()
  user?: User;
}
