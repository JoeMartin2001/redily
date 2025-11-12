import { Module } from '@nestjs/common';
import { PhoneOTPService } from './phone-otp.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailOTPService } from './email-otp.service';
import { EmailClientModule } from '../email-client/email-client.module';
import { EskizService } from './eskiz.service';
import { PHONE_OTP_SERVICE } from './phone-otp.constants';
import { EskizAuthService } from './eskiz-auth.service';
import { HttpModule } from '@nestjs/axios';
import { ESKIZ_CREDENTIALS } from './eskiz.constants';

@Module({
  providers: [
    PhoneOTPService,
    EmailOTPService,
    EskizService,
    EskizAuthService,
    {
      provide: ESKIZ_CREDENTIALS,
      useFactory: (configService: ConfigService) => ({
        email: configService.get<string>('app.eskizEmailAddress') ?? '',
        password: configService.get<string>('app.eskizPassword') ?? '',
      }),
      inject: [ConfigService],
    },
    {
      provide: PHONE_OTP_SERVICE,
      useFactory: (
        configService: ConfigService,
        emailOTPService: EmailOTPService,
        eskizService: EskizService,
      ) => {
        const provider =
          configService.get<string>('app.otpProvider') ?? 'eskiz';

        if (provider === 'email') {
          return emailOTPService;
        }

        return eskizService;
      },
      inject: [ConfigService, EmailOTPService, EskizService],
    },
  ],
  exports: [PhoneOTPService],
  imports: [
    ConfigModule,
    EmailClientModule,
    HttpModule.register({
      baseURL: 'https://notify.eskiz.uz/api',
      maxBodyLength: Infinity,
    }),
  ],
})
export class PhoneOTPModule {}
