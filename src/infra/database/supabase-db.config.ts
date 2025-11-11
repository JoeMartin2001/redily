// supabase-db.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/entities/user.entity';
import { Ride } from 'src/modules/rides/entities/ride.entity';
import { Booking } from 'src/modules/bookings/entities/booking.entity';
import { OTPCodeEntity } from 'src/modules/otp/entities/otpcode.entity';
import { PasswordResetToken } from 'src/modules/auth/entities/password-reset-token.entity';
import { EmailVerificationToken } from 'src/modules/auth/entities/email-verification-token.entity';
import { Environment } from '../config/env.validation';

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
    ],

    // Synchronize should be false in production
    synchronize: [Environment.Development, Environment.Local].includes(
      configService.get<Environment>('app.nodeEnv')!,
    ),

    // Logging
    logging: [Environment.Development, Environment.Local].includes(
      configService.get<Environment>('app.nodeEnv')!,
    ),

    // Migrations
    migrations: [__dirname + '/../migrations/*.ts'],
    migrationsRun: true,

    // Other options
    connectTimeoutMS: 10000, // 10 seconds
    maxQueryExecutionTime: 5000, // 5 seconds
  };
};
