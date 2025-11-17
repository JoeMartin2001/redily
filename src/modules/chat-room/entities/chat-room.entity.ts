import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { IChatRoom, ChatRoomStatus, IChatMessage } from 'src/common/interfaces';
import { TableName } from 'src/common/constants/TableName';
import { Entity, OneToMany } from 'typeorm';
import { PrimaryGeneratedColumn } from 'typeorm';
import { Column } from 'typeorm';
import { ChatMessage } from 'src/modules/chat-message/entities/chat-message.entity';

@ObjectType()
@Entity(TableName.CHAT_ROOMS)
export class ChatRoom implements IChatRoom {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  rideId!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  senderId!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  receiverId!: string;

  @Field(() => GraphQLISODateTime)
  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Column({ type: 'timestamptz' })
  updatedAt!: Date;

  @Field(() => ChatRoomStatus)
  @Column({ type: 'enum', enum: ChatRoomStatus })
  status!: ChatRoomStatus;

  @Field(() => [ChatMessage])
  @OneToMany(() => ChatMessage, (chatMessage) => chatMessage.chatRoomId)
  messages?: IChatMessage[];
}
