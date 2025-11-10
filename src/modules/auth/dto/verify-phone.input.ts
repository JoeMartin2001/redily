import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class VerifyPhoneInput {
  @Field(() => String)
  phoneNumber: string;

  @Field(() => String)
  code: string;
}
