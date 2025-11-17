import { registerEnumType } from '@nestjs/graphql';

// Direct 1-on-1 messages
export interface IChatMessage {
  id: string;
  rideId: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
  isRead: boolean;
  type: ChatMessageType;
  status: ChatMessageStatus;
  chatRoomId: string;
}

export enum ChatMessageType {
  TEXT = 'text',
  VOICE = 'voice',
  IMAGE = 'image',
}

export enum ChatMessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

registerEnumType(ChatMessageStatus, {
  name: 'ChatMessageStatus',
  description: 'Chat message status',
});
