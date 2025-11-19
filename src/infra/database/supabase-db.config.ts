// supabase-db.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { join } from 'path';

import { User } from 'src/modules/user/entities/user.entity';
import { Ride } from 'src/modules/rides/entities/ride.entity';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { OTPCodeEntity } from 'src/modules/otp/entities/otpcode.entity';
import { PasswordResetToken } from 'src/modules/auth/entities/password-reset-token.entity';
import { EmailVerificationToken } from 'src/modules/auth/entities/email-verification-token.entity';
import { Environment } from '../config/env.validation';
import { ChatRoom } from 'src/modules/chat-room/entities/chat-room.entity';
import { ChatMessage } from 'src/modules/chat-message/entities/chat-message.entity';
import { RideRule } from 'src/modules/ride-rules/entities/ride-rule.entity';
import { RideRequest } from 'src/modules/ride-requests/entities/ride-request.entity';
import { Vehicle } from 'src/modules/vehicles/entities/vehicle.entity';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { Notification } from 'src/modules/notifications/entities/notification.entity';

export const supabaseDbConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  // Alternative: Get from Supabase connection string
  const databaseUrl = configService.get<string>('app.supabaseDatabaseUrl');

  return {
    type: 'postgres',

    url: databaseUrl,

    // SSL configuration for Supabase
    ssl: true,
    extra: {
      ssl: {
        rejectUnauthorized: false, // Required for Supabase
      },
    },

    // Entity configuration - exclude RegionEntity and DistrictEntity from synchronize
    // They are handled by migrations and registered via TypeOrmModule.forFeature() in their modules
    entities: [
      User,
      Ride,
      Booking,
      OTPCodeEntity,
      PasswordResetToken,
      EmailVerificationToken,
      ChatRoom,
      ChatMessage,
      RideRule,
      RideRequest,
      Vehicle,
      Review,
      Notification,
      // RegionEntity and DistrictEntity excluded - handled by migrations
    ],
    // Drop schema in local/development to fix existing NULL values issue
    // This will drop and recreate tables, allowing synchronize to work properly
    // dropSchema: [Environment.Development, Environment.Local].includes(
    //   configService.get<Environment>('app.nodeEnv')!,
    // ),

    // Logging
    logging: [Environment.Development, Environment.Local].includes(
      configService.get<Environment>('app.nodeEnv')!,
    ),

    // Migrations - use .js for compiled migrations (works in both dev and prod)
    migrations: [join(__dirname, '../migrations/*.js')],
    // Run migrations automatically to seed regions and districts data
    migrationsRun: true,

    // Synchronize enabled for all tables - migrations handle regions/districts separately
    // Migration runs after synchronize and will drop/recreate regions/districts with seed data
    // synchronize: [Environment.Development, Environment.Local].includes(
    //   configService.get<Environment>('app.nodeEnv')!,
    // ),

    // Other options
    connectTimeoutMS: 10000, // 10 seconds
    maxQueryExecutionTime: 5000, // 5 seconds

    namingStrategy: new SnakeNamingStrategy(),
  };
};
