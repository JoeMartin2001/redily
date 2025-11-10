import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { UserService } from '../user/user.service';
import { EmailModule } from '../email/email.module';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailService } from '../email/email.service';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { StorageService } from 'src/infra/storage/storage.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtSupabaseStrategy } from './strategies/jwt.supabase.strategy';
import { SupabaseModule } from 'src/infra/supabase/supabase.module';
import { OTPCodeModule } from '../otp/otp-code.module';

@Module({
  providers: [
    AuthResolver,
    AuthService,
    JwtSupabaseStrategy,
    ConfigService,
    LocalStrategy,
    EmailService,
    UserService,
    StorageService,
  ],
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([
      User,
      PasswordResetToken,
      EmailVerificationToken,
    ]),
    ConfigModule,
    SupabaseModule,
    UserModule,
    EmailModule,
    OTPCodeModule,
  ],
  exports: [AuthService],
})
export class AuthModule {}
