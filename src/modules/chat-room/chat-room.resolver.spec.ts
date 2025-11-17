import { Test, TestingModule } from '@nestjs/testing';
import { ChatRoomResolver } from './chat-room.resolver';
import { ChatRoomService } from './chat-room.service';

describe('ChatRoomResolver', () => {
  let resolver: ChatRoomResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatRoomResolver, ChatRoomService],
    }).compile();

    resolver = module.get<ChatRoomResolver>(ChatRoomResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
