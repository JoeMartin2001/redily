import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';

export interface EmailClientServiceInterface {
  sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void>;
}

@Injectable()
export class EmailClientService implements EmailClientServiceInterface {
  private readonly transporter: Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('app.gmailUser'),
        pass: this.configService.get('app.gmailPass'),
      },
    });
  }

  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {
    try {
      await this.transporter?.sendMail({
        from: 'Monolingo <no-reply@monolingo.com>',
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new InternalServerErrorException(
        this.i18n.t('error.internal_server_error', {
          args: { message: errorMessage },
        }),
      );
    }
  }
}
