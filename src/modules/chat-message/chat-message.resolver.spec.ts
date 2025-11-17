import { Test, TestingModule } from '@nestjs/testing';
import { ChatMessageResolver } from './chat-message.resolver';
import { ChatMessageService } from './chat-message.service';

describe('ChatMessageResolver', () => {
  let resolver: ChatMessageResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatMessageResolver, ChatMessageService],
    }).compile();

    resolver = module.get<ChatMessageResolver>(ChatMessageResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
