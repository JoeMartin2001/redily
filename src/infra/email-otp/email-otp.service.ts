import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
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
import { I18nService } from 'nestjs-i18n';
import { EmailClientService } from '../email-client/email-client.service';
import { v4 as uuidv4 } from 'uuid';

const temporaryEmail = 'sardorbekaminjonov2001@gmail.com';

@Injectable()
export class EmailOTPService implements PhoneOTPInterface {
  private readonly logger = new Logger(EmailOTPService.name, {
    timestamp: true,
  });

  constructor(
    private readonly i18n: I18nService,
    private readonly emailClientService: EmailClientService,
  ) {}

  async send(phoneOTP: PhoneOTPRequest): Promise<PhoneOTPResponse> {
    try {
      const id = uuidv4();

      await this.emailClientService.sendEmail({
        to: temporaryEmail,
        subject: `Email OTP for ${phoneOTP.phoneNumber}`,
        html: phoneOTP.message,
      });

      return {
        id: id,
        message: 'Email OTP sent successfully',
        status: 'success',
      };
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
      const { messages } = phoneOTP;

      for (const message of messages) {
        await this.emailClientService.sendEmail({
          to: message.to.toString(),
          subject: 'Email OTP',
          html: `Your OTP code is ${message.text}`,
        });
      }

      return {
        id: uuidv4(),
        message: 'Email OTP sent successfully',
        status: messages.map((message) => message.user_sms_id),
      };
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
      await this.emailClientService.sendEmail({
        to: phoneOTPGlobalRequest.phoneNumber,
        subject: 'Email OTP',
        html: `Your OTP code is ${phoneOTPGlobalRequest.message}`,
      });

      return {
        id: uuidv4(),
        message: 'Email OTP sent successfully',
        status: 'success',
      };
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
      this.logger.log(`Normalizing message: ${message}`);

      const fakeResponse: NormalizeMessageResponse = await Promise.resolve({
        special_characters: [
          {
            char: 'a',
            code: 'a',
            position: 0,
          },
        ],
      });

      return fakeResponse;
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
