import { registerEnumType } from '@nestjs/graphql';

// Direct 1-on-1 messages
export interface IChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export enum ChatMessageType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image',
}

registerEnumType(ChatMessageType, {
  name: 'ChatMessageType',
  description: 'Chat message type',
});
