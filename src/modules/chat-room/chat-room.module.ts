import { Module } from '@nestjs/common';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomResolver } from './chat-room.resolver';

@Module({
  providers: [ChatRoomResolver, ChatRoomService],
})
export class ChatRoomModule {}
