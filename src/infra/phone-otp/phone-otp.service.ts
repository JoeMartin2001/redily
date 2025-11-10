import { Injectable } from '@nestjs/common';
// import { EskizService } from '../eskiz/eskiz.service';
import {
  PhoneOTPGlobalRequest,
  PhoneOTPGlobalResponse,
  NormalizeMessageResponse,
  PhoneOTPBatchRequest,
  PhoneOTPBatchResponse,
  PhoneOTPInterface,
  PhoneOTPRequest,
  PhoneOTPResponse,
} from 'src/infra/phone-otp/interfaces/PhoneOTPInterface';
import { EmailOTPService } from '../email-otp/email-otp.service';

@Injectable()
export class PhoneOTPService implements PhoneOTPInterface {
  // constructor(private readonly otpService: EskizService) {}
  constructor(private readonly otpService: EmailOTPService) {}

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
