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
import { RegionEntity } from 'src/modules/regions/entities/region.entity';
import { DistrictEntity } from 'src/modules/districts/entites/district.entity';

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

    // Entity configuration
    entities: [
      User,
      Ride,
      Booking,
      OTPCodeEntity,
      PasswordResetToken,
      EmailVerificationToken,
      RegionEntity,
      DistrictEntity,
    ],

    // Synchronize should be false when using migrations
    // Disabled to prevent conflicts with migrations
    synchronize: false,

    // Drop schema in local development only (dangerous - use with caution)
    dropSchema:
      configService.get<Environment>('app.nodeEnv') === Environment.Local,

    // Logging
    logging: [Environment.Development, Environment.Local].includes(
      configService.get<Environment>('app.nodeEnv')!,
    ),

    // Migrations - use .js for compiled migrations (works in both dev and prod)
    migrations: [join(__dirname, '../migrations/*.js')],
    migrationsRun: true,

    // Other options
    connectTimeoutMS: 10000, // 10 seconds
    maxQueryExecutionTime: 5000, // 5 seconds

    namingStrategy: new SnakeNamingStrategy(),
  };
};
