import { CreateChatRoomInput } from './create-chat-room.input';
import { InputType, Field, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateChatRoomInput extends PartialType(CreateChatRoomInput) {
  @Field(() => String)
  id!: string;
}
