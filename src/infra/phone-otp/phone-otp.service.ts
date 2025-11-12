import { Inject, Injectable } from '@nestjs/common';
import type {
  PhoneOTPGlobalRequest,
  PhoneOTPGlobalResponse,
  NormalizeMessageResponse,
  PhoneOTPBatchRequest,
  PhoneOTPBatchResponse,
  PhoneOTPInterface,
  PhoneOTPRequest,
  PhoneOTPResponse,
} from 'src/infra/phone-otp/interfaces/PhoneOTPInterface';
import { PHONE_OTP_SERVICE } from './phone-otp.constants';

@Injectable()
export class PhoneOTPService implements PhoneOTPInterface {
  constructor(
    @Inject(PHONE_OTP_SERVICE)
    private readonly otpService: PhoneOTPInterface,
  ) {}

  async send(phoneOTP: PhoneOTPRequest): Promise<PhoneOTPResponse> {
    return await this.otpService.send(phoneOTP);
  }

  async sendBatch(
    phoneOTP: PhoneOTPBatchRequest,
  ): Promise<PhoneOTPBatchResponse> {
    return await this.otpService.sendBatch(phoneOTP);
  }

  async normalizeMessage(message: string): Promise<NormalizeMessageResponse> {
    return await this.otpService.normalizeMessage(message);
  }

  async sendGlobalMessage(
    phoneOTPGlobalRequest: PhoneOTPGlobalRequest,
  ): Promise<PhoneOTPGlobalResponse> {
    return await this.otpService.sendGlobalMessage(phoneOTPGlobalRequest);
  }
}
