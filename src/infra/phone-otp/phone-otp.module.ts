import { Module } from '@nestjs/common';
import { EskizModule } from '../eskiz/eskiz.module';
import { PhoneOTPService } from './phone-otp.service';

@Module({
  providers: [PhoneOTPService],
  exports: [PhoneOTPService],
  imports: [EskizModule],
})
export class PhoneOTPModule {}
