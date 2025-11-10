import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
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
export class EskizService implements PhoneOTPInterface {
  private readonly eskizApiKey: string;
  private readonly eskizEmailAddress: string;
  private readonly eskizPassword: string;

  constructor(private readonly configService: ConfigService) {
    this.eskizApiKey = this.configService.get<string>('app.eskizApiKey') ?? '';
    this.eskizPassword =
      this.configService.get<string>('app.eskizPassword') ?? '';
    this.eskizEmailAddress =
      this.configService.get<string>('app.eskizEmailAddress') ?? '';
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
      'https://notify.eskiz.uz/api/auth/login',
      loginRequest,
      {
        headers: {
          Authorization: `Bearer ${this.eskizApiKey}`,
        },
        data: {
          email: this.eskizEmailAddress,
          password: this.eskizPassword,
        },
      },
    );

    return response.data;
  }

  async refreshToken(
    refreshTokenRequest: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    const response = await axios.post<RefreshTokenResponse>(
      'https://notify.eskiz.uz/api/auth/refresh',
      refreshTokenRequest,
    );

    return response.data;
  }

  async send(phoneOTP: PhoneOTPRequest): Promise<PhoneOTPResponse> {
    const response = await axios.post<PhoneOTPResponse>(
      'https://notify.eskiz.uz/api/message/send',
      phoneOTP,
    );

    return response.data;
  }

  async sendBatch(
    phoneOTP: PhoneOTPBatchRequest,
  ): Promise<PhoneOTPBatchResponse> {
    const response = await axios.post<PhoneOTPBatchResponse>(
      'https://notify.eskiz.uz/api/message/send-batch',
      phoneOTP,
    );

    return response.data;
  }

  async normalizeMessage(message: string): Promise<NormalizeMessageResponse> {
    const response = await axios.post<NormalizeMessageResponse>(
      'https://notify.eskiz.uz/api/message/normalize',
      { message },
    );

    return response.data;
  }
}
