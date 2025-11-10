import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OTPCodeEntity } from './entities/otpcode.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PhoneOTPService } from 'src/infra/phone-otp/phone-otp.service';
import { isPhoneNumber } from 'class-validator';

@Injectable()
export class OTPCodeService {
  constructor(
    @InjectRepository(OTPCodeEntity)
    private readonly otpCodeRepository: Repository<OTPCodeEntity>,
    private readonly phoneOTPService: PhoneOTPService,
  ) {}

  async generateAndSendOtp(phoneNumber: string): Promise<boolean> {
    if (!isPhoneNumber(phoneNumber, 'UZ')) {
      throw new BadRequestException('Invalid phone number format');
    }

    const otpCode = this.otpCodeRepository.create({
      phoneNumber,
      code: Math.floor(100000 + Math.random() * 900000).toString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 5),
      attempts: 0,
    });

    const savedOtpCode = await this.otpCodeRepository.save(otpCode);

    console.log('savedOtpCode', savedOtpCode);

    await this.phoneOTPService.send({
      phoneNumber,
      //   message: 'This is test from Eskiz',
      message: `Your OTP code is ${savedOtpCode.code}`,
    });

    return true;
  }

  async verifyOtpCode(phoneNumber: string, code: string): Promise<boolean> {
    const otpCode = await this.otpCodeRepository.findOne({
      where: { phoneNumber, code },
    });

    if (!otpCode) {
      throw new NotFoundException('OTP code not found');
    }

    if (otpCode.expiresAt < new Date()) {
      throw new UnauthorizedException('OTP code has expired');
    }

    if (otpCode.attempts >= 3) {
      throw new UnauthorizedException('OTP code has been used too many times');
    }

    return true;
  }
}
