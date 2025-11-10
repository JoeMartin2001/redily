import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class VerifyPhoneInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  code: string;
}
