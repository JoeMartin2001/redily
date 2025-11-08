import { Test, TestingModule } from '@nestjs/testing';
import { BookingsResolver } from './bookings.resolver';
import { BookingsService } from './bookings.service';

describe('BookingsResolver', () => {
  let resolver: BookingsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BookingsResolver, BookingsService],
    }).compile();

    resolver = module.get<BookingsResolver>(BookingsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
