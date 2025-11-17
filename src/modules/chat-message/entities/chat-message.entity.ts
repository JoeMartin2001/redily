import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TableName } from 'src/common/constants/TableName';
import {
  ChatMessageStatus,
  ChatMessageType,
  IChatMessage,
} from 'src/common/interfaces';

@ObjectType()
@Entity(TableName.CHAT_MESSAGES)
export class ChatMessage implements Partial<IChatMessage> {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 255 })
  message!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  senderId!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  receiverId!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  chatRoomId!: string;

  @Field(() => String)
  @Column({ type: 'uuid' })
  rideId!: string;

  @Field(() => ChatMessageStatus)
  @Column({ type: 'enum', enum: ChatMessageStatus })
  status!: ChatMessageStatus;

  @Field(() => ChatMessageType)
  @Column({ type: 'enum', enum: ChatMessageType })
  type!: ChatMessageType;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: false })
  isRead!: boolean;

  @Field(() => GraphQLISODateTime)
  @Column({ type: 'timestamptz', default: new Date() })
  createdAt!: Date;

  @Field(() => GraphQLISODateTime)
  @Column({ type: 'timestamptz', default: new Date() })
  updatedAt!: Date;
}
