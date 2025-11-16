import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class TelegramAuthInput {
  @Field()
  id: string;

  @Field()
  first_name: string;

  @Field({ nullable: true })
  last_name?: string;

  @Field({ nullable: true })
  username?: string;

  @Field()
  auth_date: string;

  @Field()
  hash: string;

  // optional: photos
  @Field({ nullable: true })
  photo_url?: string;
}
