import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { User } from 'src/modules/user/entities/user.entity';
import { PasswordResetToken } from 'src/modules/auth/entities/password-reset-token.entity';
import { Environment } from '../config/env.validation';
import { EmailVerificationToken } from 'src/modules/auth/entities/email-verification-token.entity';
import { OTPCodeEntity } from 'src/modules/otp/entities/otpcode.entity';
import { Ride } from 'src/modules/rides/entities/ride.entity';
import { ChatRoom } from 'src/modules/chat-room/entities/chat-room.entity';
import { ChatMessage } from 'src/modules/chat-message/entities/chat-message.entity';
import { RideRule } from 'src/modules/ride-rules/entities/ride-rule.entity';
import { RideRequest } from 'src/modules/ride-requests/entities/ride-request.entity';
import { Vehicle } from 'src/modules/vehicles/entities/vehicle.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres' as const,
  host: config.get<string>('database.host'),
  port: config.get<number>('database.port'),
  username: config.get<string>('database.username'),
  password: config.get<string>('database.password'),
  database: config.get<string>('database.name'),
  ssl: config.get<boolean>('database.ssl'),
  autoLoadEntities: true,

  // Synchronize enabled for all tables - migrations handle regions/districts separately
  // Migration runs after synchronize and will drop/recreate regions/districts with seed data
  synchronize: [Environment.Development, Environment.Local].includes(
    config.get<Environment>('app.nodeEnv')!,
  ), // use migrations instead
  logging: [Environment.Development, Environment.Local].includes(
    config.get<Environment>('app.nodeEnv')!,
  )
    ? ['query', 'error', 'schema']
    : false,
  entities: [
    User,
    PasswordResetToken,
    EmailVerificationToken,
    OTPCodeEntity,
    Ride,
    ChatRoom,
    ChatMessage,
    RideRule,
    RideRequest,
    Vehicle,
    Review,
    Notification,
  ],
  dropSchema: true,

  // Migrations - use .js for compiled migrations (works in both dev and prod)
  migrations: [join(__dirname, '../migrations/*.js')],
  // Run migrations automatically to seed regions and districts data
  migrationsRun: true,

  namingStrategy: new SnakeNamingStrategy(),
});
