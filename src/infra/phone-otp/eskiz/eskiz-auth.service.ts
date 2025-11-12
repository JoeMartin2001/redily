import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { I18nService } from 'nestjs-i18n';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';
import type { LoginResponse, RefreshTokenResponse } from './eskiz.service';
import { ESKIZ_CREDENTIALS } from './eskiz.constants';
import type { EskizCredentials } from './eskiz.constants';

@Injectable()
export class EskizAuthService {
  private readonly logger = new Logger(EskizAuthService.name, {
    timestamp: true,
  });

  private accessToken?: string;

  constructor(
    private readonly httpService: HttpService,
    @Inject(ESKIZ_CREDENTIALS)
    private readonly credentials: EskizCredentials,
    private readonly i18n: I18nService,
  ) {}

  async getAccessToken(): Promise<string> {
    if (!this.accessToken) {
      await this.authenticate();
    }

    return this.accessToken ?? '';
  }

  async refreshToken(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch<RefreshTokenResponse>(
          '/auth/refresh',
          undefined,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        ),
      );

      this.accessToken = response.data.access_token;

      return this.accessToken;
    } catch (error) {
      this.logger.error(error);

      throw this.wrapAsInternalError(error);
    }
  }

  private async authenticate(): Promise<void> {
    const formData = new FormData();

    formData.append('email', this.credentials.email);
    formData.append('password', this.credentials.password);

    try {
      const response = await firstValueFrom(
        this.httpService.post<LoginResponse>('/auth/login', formData, {
          headers: {
            ...formData.getHeaders(),
          },
        }),
      );

      this.accessToken = response.data.data.token;
    } catch (error) {
      this.logger.error(error);

      throw this.wrapAsInternalError(error);
    }
  }

  private wrapAsInternalError(error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';

    return new InternalServerErrorException(
      this.i18n.t('error.internal_server_error', {
        args: { message: errorMessage },
      }),
    );
  }
}
