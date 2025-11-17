import { CreateChatMessageInput } from './create-chat-message.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateChatMessageInput extends PartialType(CreateChatMessageInput) {
  @Field(() => Int)
  id: number;
}
