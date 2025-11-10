import { Module } from '@nestjs/common';
import { OTPCodeService } from './otp-code.service';
import { PhoneOTPModule } from 'src/infra/phone-otp/phone-otp.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTPCodeEntity } from './entities/otpcode.entity';

@Module({
  providers: [OTPCodeService],
  exports: [OTPCodeService],
  imports: [PhoneOTPModule, TypeOrmModule.forFeature([OTPCodeEntity])],
})
export class OTPCodeModule {}
