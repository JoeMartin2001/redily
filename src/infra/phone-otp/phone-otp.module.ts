import { Module } from '@nestjs/common';
// import { EskizModule } from '../eskiz/eskiz.module';
import { PhoneOTPService } from './phone-otp.service';
import { ConfigModule } from '@nestjs/config';
import { EmailOTPModule } from '../email-otp/email-otp.module';

@Module({
  providers: [PhoneOTPService],
  exports: [PhoneOTPService],
  // imports: [EskizModule],
  imports: [ConfigModule, EmailOTPModule],
})
export class PhoneOTPModule {}
