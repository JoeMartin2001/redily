import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  LoginRequest,
  LoginResponse,
  NormalizeMessageResponse,
  PhoneOTPBatchRequest,
  PhoneOTPBatchResponse,
  PhoneOTPGlobalRequest,
  PhoneOTPGlobalResponse,
  PhoneOTPInterface,
  PhoneOTPRequest,
  PhoneOTPResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from 'src/infra/phone-otp/interfaces/PhoneOTPInterface';
import FormData from 'form-data';
import { I18nService } from 'nestjs-i18n';
@Injectable()
export class EskizService implements PhoneOTPInterface {
  private readonly eskizEmailAddress: string;
  private readonly eskizPassword: string;
  private eskizToken: string;
  private readonly logger = new Logger(EskizService.name, { timestamp: true });

  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.eskizPassword =
      this.configService.get<string>('app.eskizPassword') ?? '';
    this.eskizEmailAddress =
      this.configService.get<string>('app.eskizEmailAddress') ?? '';

    this.logger.log(this.eskizEmailAddress, this.eskizPassword);

    this.login({
      email: this.eskizEmailAddress,
      password: this.eskizPassword,
    }).catch((error) => {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`Failed to authenticate with Eskiz: ${errorMessage}`);
    });
  }

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const data = new FormData();

    data.append('email', loginRequest.email);
    data.append('password', loginRequest.password);

    try {
      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://notify.eskiz.uz/api/auth/login',
        headers: {
          ...data.getHeaders(),
        },
        data: data,
      };

      const response = await axios.request<LoginResponse>(config);

      this.eskizToken = response.data.data.token;

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(errorMessage);

      throw new InternalServerErrorException(
        this.i18n.t('error.internal_server_error', {
          args: { message: errorMessage },
        }),
      );
    }
  }

  async refreshToken(
    refreshTokenRequest: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> {
    const response = await axios.post(
      'https://notify.eskiz.uz/api/auth/refresh',
      refreshTokenRequest,
      {
        headers: {
          Authorization: `Bearer ${this.eskizToken}`,
        },
      },
    );

    return response.data as RefreshTokenResponse;
  }

  async send(phoneOTP: PhoneOTPRequest): Promise<PhoneOTPResponse> {
    try {
      const data = new FormData();
      data.append('mobile_phone', phoneOTP.phoneNumber);
      data.append('message', phoneOTP.message);

      if (phoneOTP.from) {
        data.append('from', phoneOTP.from.toISOString());
      }

      if (phoneOTP.callback_url) {
        data.append('callback_url', phoneOTP.callback_url.toISOString());
      }

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://notify.eskiz.uz/api/message/sms/send',
        headers: {
          ...data.getHeaders(),
          Authorization: `Bearer ${this.eskizToken}`,
        },
        data: data,
      };

      const response = await axios.request(config);

      return response.data as PhoneOTPResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error(errorMessage);

      throw new InternalServerErrorException(
        this.i18n.t('error.internal_server_error', {
          args: { message: errorMessage },
        }),
      );
    }
  }

  async sendBatch(
    phoneOTP: PhoneOTPBatchRequest,
  ): Promise<PhoneOTPBatchResponse> {
    try {
      const data = new FormData();
      data.append('messages', JSON.stringify(phoneOTP.messages));

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://notify.eskiz.uz/api/message/sms/send-batch',
        headers: {
          Authorization: `Bearer ${this.eskizToken}`,
        },
        data: JSON.stringify(phoneOTP),
      };

      const response = await axios.request(config);

      return response.data as PhoneOTPBatchResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error(errorMessage);

      throw new InternalServerErrorException(
        this.i18n.t('error.internal_server_error', {
          args: { message: errorMessage },
        }),
      );
    }
  }

  async sendGlobalMessage(
    phoneOTPGlobalRequest: PhoneOTPGlobalRequest,
  ): Promise<PhoneOTPGlobalResponse> {
    try {
      const data = new FormData();
      data.append('mobile_phone', phoneOTPGlobalRequest.phoneNumber);
      data.append('message', phoneOTPGlobalRequest.message);
      data.append('country_code', phoneOTPGlobalRequest.countryCode);
      data.append(
        'callback_url',
        phoneOTPGlobalRequest.callback_url?.toISOString() ?? '',
      );
      data.append('unicode', phoneOTPGlobalRequest.unicode.toString());

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://notify.eskiz.uz/api/message/sms/send-global',
        headers: {
          Authorization: `Bearer ${this.eskizToken}`,
          ...data.getHeaders(),
        },
        data: data,
      };

      const response = await axios.request<PhoneOTPGlobalResponse>(config);

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error(errorMessage);

      throw new InternalServerErrorException(
        this.i18n.t('error.internal_server_error', {
          args: { message: errorMessage },
        }),
      );
    }
  }

  async normalizeMessage(message: string): Promise<NormalizeMessageResponse> {
    try {
      const data = new FormData();
      data.append('message', message);

      const config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://notify.eskiz.uz/api/message/sms/normalizer',
        headers: { ...data.getHeaders() },
        data: data,
      };

      const response = await axios.request<NormalizeMessageResponse>(config);

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error(errorMessage);

      throw new InternalServerErrorException(
        this.i18n.t('error.internal_server_error', {
          args: { message: errorMessage },
        }),
      );
    }
  }
}
