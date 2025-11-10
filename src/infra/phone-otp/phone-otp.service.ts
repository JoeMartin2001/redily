import { Injectable } from '@nestjs/common';
import { EskizService } from '../eskiz/eskiz.service';
import {
  LoginRequest,
  LoginResponse,
  NormalizeMessageResponse,
  PhoneOTPBatchRequest,
  PhoneOTPBatchResponse,
  PhoneOTPInterface,
  PhoneOTPRequest,
  PhoneOTPResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from 'src/modules/auth/interfaces/PhoneOTPInterface';

@Injectable()
export class PhoneOTPService implements PhoneOTPInterface {
  constructor(private readonly otpService: EskizService) {}

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

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    return await this.otpService.login(loginRequest);
  }

  async refreshToken(
    refreshTokenRequest: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    return await this.otpService.refreshToken(refreshTokenRequest);
  }
}
