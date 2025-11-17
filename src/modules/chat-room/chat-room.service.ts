import { Injectable } from '@nestjs/common';
import { CreateChatRoomInput } from './dto/create-chat-room.input';
import { UpdateChatRoomInput } from './dto/update-chat-room.input';

@Injectable()
export class ChatRoomService {
  create(createChatRoomInput: CreateChatRoomInput) {
    return 'This action adds a new chatRoom';
  }

  findAll() {
    return `This action returns all chatRoom`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatRoom`;
  }

  update(id: number, updateChatRoomInput: UpdateChatRoomInput) {
    return `This action updates a #${id} chatRoom`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatRoom`;
  }
}
