import { InputType, Field } from '@nestjs/graphql';
import { ChatRoomStatus, IChatRoom } from 'src/common/interfaces';

@InputType()
export class CreateChatRoomInput implements Partial<IChatRoom> {
  @Field(() => String)
  rideId!: string;

  @Field(() => String)
  senderId!: string;

  @Field(() => String)
  receiverId!: string;

  @Field(() => ChatRoomStatus)
  status!: ChatRoomStatus;
}
