import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ChatRoomService } from './chat-room.service';
import { ChatRoom } from './entities/chat-room.entity';
import { CreateChatRoomInput } from './dto/create-chat-room.input';
import { UpdateChatRoomInput } from './dto/update-chat-room.input';

@Resolver(() => ChatRoom)
export class ChatRoomResolver {
  constructor(private readonly chatRoomService: ChatRoomService) {}

  @Mutation(() => ChatRoom)
  createChatRoom(@Args('createChatRoomInput') createChatRoomInput: CreateChatRoomInput) {
    return this.chatRoomService.create(createChatRoomInput);
  }

  @Query(() => [ChatRoom], { name: 'chatRoom' })
  findAll() {
    return this.chatRoomService.findAll();
  }

  @Query(() => ChatRoom, { name: 'chatRoom' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.chatRoomService.findOne(id);
  }

  @Mutation(() => ChatRoom)
  updateChatRoom(@Args('updateChatRoomInput') updateChatRoomInput: UpdateChatRoomInput) {
    return this.chatRoomService.update(updateChatRoomInput.id, updateChatRoomInput);
  }

  @Mutation(() => ChatRoom)
  removeChatRoom(@Args('id', { type: () => Int }) id: number) {
    return this.chatRoomService.remove(id);
  }
}
