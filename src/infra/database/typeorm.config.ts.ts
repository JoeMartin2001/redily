import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/modules/user/entities/user.entity';
import { PasswordResetToken } from 'src/modules/auth/entities/password-reset-token.entity';
import { Environment } from '../config/env.validation';
import { EmailVerificationToken } from 'src/modules/auth/entities/email-verification-token.entity';
import { OTPCodeEntity } from 'src/modules/otp/entities/otpcode.entity';
import { Ride } from 'src/modules/rides/entities/ride.entity';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres' as const,
  host: config.get<string>('database.host'),
  port: config.get<number>('database.port'),
  username: config.get<string>('database.username'),
  password: config.get<string>('database.password'),
  database: config.get<string>('database.name'),
  ssl: config.get<boolean>('database.ssl'),
  autoLoadEntities: true,
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
  ],
  dropSchema: true,
});
