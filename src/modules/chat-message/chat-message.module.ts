import { Module } from '@nestjs/common';
import { ChatMessageService } from './chat-message.service';
import { ChatMessageResolver } from './chat-message.resolver';

@Module({
  providers: [ChatMessageResolver, ChatMessageService],
})
export class ChatMessageModule {}
