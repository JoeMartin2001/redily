import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  NormalizeMessageResponse,
  PhoneOTPBatchRequest,
  PhoneOTPBatchResponse,
  PhoneOTPGlobalRequest,
  PhoneOTPGlobalResponse,
  PhoneOTPInterface,
  PhoneOTPRequest,
  PhoneOTPResponse,
} from 'src/infra/phone-otp/interfaces/PhoneOTPInterface';
import FormData from 'form-data';
import { I18nService } from 'nestjs-i18n';
import { firstValueFrom } from 'rxjs';
import { EskizAuthService } from './eskiz-auth.service';
import { isAxiosError } from 'axios';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    token: string;
  };
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class EskizService implements PhoneOTPInterface {
  private readonly logger = new Logger(EskizService.name, { timestamp: true });

  constructor(
    private readonly httpService: HttpService,
    private readonly eskizAuthService: EskizAuthService,
    private readonly i18n: I18nService,
  ) {}

  async send(phoneOTP: PhoneOTPRequest): Promise<PhoneOTPResponse> {
    const data = new FormData();
    data.append('mobile_phone', phoneOTP.phoneNumber);
    data.append('message', phoneOTP.message);

    if (phoneOTP.from) {
      data.append('from', phoneOTP.from.toISOString());
    }

    if (phoneOTP.callback_url) {
      data.append('callback_url', phoneOTP.callback_url.toISOString());
    }

    return this.makeAuthorizedRequest<PhoneOTPResponse>(
      '/message/sms/send',
      data,
    );
  }

  async sendBatch(
    phoneOTP: PhoneOTPBatchRequest,
  ): Promise<PhoneOTPBatchResponse> {
    return this.makeAuthorizedRequest<PhoneOTPBatchResponse>(
      '/message/sms/send-batch',
      phoneOTP,
    );
  }

  async sendGlobalMessage(
    phoneOTPGlobalRequest: PhoneOTPGlobalRequest,
  ): Promise<PhoneOTPGlobalResponse> {
    const data = new FormData();
    data.append('mobile_phone', phoneOTPGlobalRequest.phoneNumber);
    data.append('message', phoneOTPGlobalRequest.message);
    data.append('country_code', phoneOTPGlobalRequest.countryCode);
    data.append(
      'callback_url',
      phoneOTPGlobalRequest.callback_url?.toISOString() ?? '',
    );
    data.append('unicode', phoneOTPGlobalRequest.unicode.toString());

    return this.makeAuthorizedRequest<PhoneOTPGlobalResponse>(
      '/message/sms/send-global',
      data,
    );
  }

  async normalizeMessage(message: string): Promise<NormalizeMessageResponse> {
    const data = new FormData();
    data.append('message', message);

    return this.makeAuthorizedRequest<NormalizeMessageResponse>(
      '/message/sms/normalizer',
      data,
      false,
    );
  }
  private async makeAuthorizedRequest<T>(
    endpoint: string,
    payload: FormData | PhoneOTPBatchRequest,
    includeFormHeaders = true,
  ): Promise<T> {
    try {
      const token = await this.eskizAuthService.getAccessToken();
      const isFormPayload = this.isFormDataPayload(payload);

      const response = await firstValueFrom(
        this.httpService.post<T>(this.normalizeEndpoint(endpoint), payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            ...(isFormPayload && includeFormHeaders
              ? payload.getHeaders()
              : {}),
          },
        }),
      );

      return response.data;
    } catch (error) {
      if (this.isUnauthorizedError(error)) {
        await this.eskizAuthService.refreshToken();
        return this.makeAuthorizedRequest<T>(
          endpoint,
          payload,
          includeFormHeaders,
        );
      }

      return this.wrapAsInternalError(error);
    }
  }

  private normalizeEndpoint(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint;
    }

    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  private isFormDataPayload(
    payload: FormData | PhoneOTPBatchRequest,
  ): payload is FormData {
    return payload instanceof FormData;
  }

  private isUnauthorizedError(error: unknown): boolean {
    if (!isAxiosError(error)) {
      return false;
    }

    return error.response?.status === HttpStatus.UNAUTHORIZED;
  }

  private wrapAsInternalError(error: unknown): never {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    this.logger.error(errorMessage, error instanceof Error ? error.stack : '');

    throw new InternalServerErrorException(
      this.i18n.t('error.internal_server_error', {
        args: { message: errorMessage },
      }),
    );
  }
}
