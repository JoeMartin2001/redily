import { Injectable } from '@nestjs/common';
import { EmailClientService } from 'src/infra/email-client/email-client.service';

@Injectable()
export class EmailService {
  constructor(private readonly emailClientService: EmailClientService) {}

  async sendPasswordReset(
    to: string,
    params: {
      username: string;
      resetLink: string;
      mobileLink: string;
      expiresInMinutes: number;
    },
  ) {
    const subject = 'Reset your Monolingo password';

    const html = `
          <p>Hi ${params.username},</p>
          <p>You requested a password reset. This link expires in ${params.expiresInMinutes} minutes.</p>
          <p><a href="${params.resetLink}">Reset password on web</a></p>
          <p>If you're on mobile, tap: <a href="${params.mobileLink}">${params.mobileLink}</a></p>
          <p>If you didn't request this, you can ignore this email.</p>
        `;

    await this.emailClientService.sendEmail({
      subject: subject,
      to: to,
      html: html,
    });
  }

  async sendEmailVerification(
    to: string,
    params: {
      username: string;
      verificationLink: string;
      expiresInMinutes: number;
    },
  ) {
    const subject = 'Verify your Monolingo email';

    const html = `
          <p>Hi ${params.username},</p>
          <p>You requested an email verification. This link expires in ${params.expiresInMinutes} minutes.</p>
          <p><a href="${params.verificationLink}">Verify email</a></p>
          <p>If you didn't request this, you can ignore this email.</p>
        `;

    await this.emailClientService.sendEmail({
      to: to,
      subject: subject,
      html: html,
    });
  }

  async sendWelcomeEmail(
    to: string,
    params: {
      username: string;
    },
  ) {
    const subject = 'Welcome to Monolingo';

    const html = `
          <p>Hi ${params.username},</p>
          <p>Welcome to Monolingo!</p>
          <p>Thank you for signing up.</p>
        `;

    await this.emailClientService.sendEmail({
      to: to,
      subject: subject,
      html: html,
    });
  }
}
