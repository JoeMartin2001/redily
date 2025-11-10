import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { Auth } from './entities/auth.entity';
import { IUserAuthProvider, IUserType } from 'src/common/interfaces/User';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { IsNull, Repository } from 'typeorm';
import { EmailService } from 'src/modules/email/email.service';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { RegisterInput } from './dto/register.input';
import { ResendVerification } from './entities/resend-verification.entity';
import { StorageService } from 'src/infra/storage/storage.service';

@Injectable()
export class AuthService {
  private googleClient: OAuth2Client;
  private FRONTEND_URL: string;
  private MOBILE_REDIRECT: string;

  constructor(
    @InjectRepository(PasswordResetToken)
    private readonly prRepo: Repository<PasswordResetToken>,
    @InjectRepository(EmailVerificationToken)
    private readonly evtRepo: Repository<EmailVerificationToken>,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly storage: StorageService,

    private readonly i18n: I18nService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('googleClientId'),
    );

    this.FRONTEND_URL =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    this.MOBILE_REDIRECT =
      this.configService.get<string>('MOBILE_REDIRECT_URI') ||
      'monolingo://reset';
  }

  private async sendEmailVerificationLink(
    user: User,
    ip?: string,
    ua?: string,
  ) {
    // invalidate previous unused tokens
    await this.evtRepo.update(
      { userId: user.id, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    const raw = crypto.randomBytes(32).toString('hex'); // 64-hex chars
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');

    await this.evtRepo.save({
      userId: user.id,
      tokenHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      usedAt: null,
      ip,
      userAgent: ua,
    });

    const link = `${this.FRONTEND_URL}/verify-email?token=${raw}`;

    await this.emailService.sendEmailVerification(user.email, {
      username: user.username ?? user.email,
      verificationLink: link,
      expiresInMinutes: 15,
    });
  }

  async resendVerification(
    email: string,
    ip?: string,
    ua?: string,
  ): Promise<ResendVerification> {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { success: true }; // avoid enumeration

    if (user.emailVerified) {
      return { success: true, alreadyVerified: true }; // already verified
    }

    // TODO: add simple throttle (e.g., check recent token timestamp)
    await this.sendEmailVerificationLink(user, ip, ua);

    return { success: true };
  }

  async verifyEmail(rawToken: string) {
    // quick shape check (optional)
    if (!/^[0-9a-f]{64}$/i.test(rawToken)) {
      throw new BadRequestException(this.i18n.t('auth.invalid_token'));
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const record = await this.evtRepo.findOne({
      where: { tokenHash, usedAt: IsNull() },
      relations: ['user'],
    });

    if (!record) {
      throw new BadRequestException(
        this.i18n.t('auth.invalid_or_expired_token'),
      );
    }

    if (record.expiresAt.getTime() < Date.now()) {
      record.usedAt = new Date();
      await this.evtRepo.save(record);

      await this.resendVerification(
        record.user.email,
        record.ip,
        record.userAgent,
      );

      return {
        success: true,
        tokenExpired: true,
        user: record.user,
      };
    }

    const user = record.user;

    if (user.emailVerified) {
      // mark token as used anyway to prevent reuse
      record.usedAt = new Date();

      await this.evtRepo.save(record);

      return {
        success: true,
        alreadyVerified: true,
        tokenExpired: false,
        user,
      };
    }

    await this.usersService.update(user.id, {
      id: user.id,
      emailVerified: true,
      emailVerifiedAt: new Date(),
    });

    record.usedAt = new Date();
    await this.evtRepo.save(record);

    // Optional: sign in after verification
    const { accessToken, refreshToken } = await this.signPair({
      id: user.id,
      email: user.email,
    });

    return {
      success: true,
      accessToken,
      refreshToken,
      alreadyVerified: false,
      user,
      tokenExpired: false,
    };
  }

  // Rate-limit-ish: invalidate existing tokens for this user before creating a new one
  private async invalidateActiveTokens(userId: string) {
    await this.prRepo.update({ userId, usedAt: null! }, { usedAt: new Date() });
  }

  async requestPasswordReset(email: string, ip?: string, ua?: string) {
    // 1) Find user (if not found, return silently)
    const user = await this.usersService.findByEmail(email);
    if (!user) return;

    // 2) Create one-time, short-lived token
    await this.invalidateActiveTokens(user.id);

    const raw = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

    const record = this.prRepo.create({
      userId: user.id,
      tokenHash,
      expiresAt,
      ip,
      userAgent: ua,
    });

    await this.prRepo.save(record);

    // 3) Build links (web + mobile)
    const webUrl = `${this.FRONTEND_URL}/reset-password?token=${raw}`;
    const mobileUrl = `${this.MOBILE_REDIRECT}?token=${raw}`;

    // 4) Send email (choose one link to include or both)
    await this.emailService.sendPasswordReset(email, {
      username: user.username || user.email,
      resetLink: webUrl,
      mobileLink: mobileUrl,
      expiresInMinutes: 15,
    });
  }

  async resetPassword(rawToken: string, newPassword: string) {
    if (!/^[0-9a-f]{64}$/i.test(rawToken)) {
      throw new BadRequestException(this.i18n.t('auth.invalid_token'));
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    // 1) Look up token
    const token = await this.prRepo.findOne({
      where: { tokenHash },
      relations: ['user'],
    });

    if (!token) {
      throw new BadRequestException(this.i18n.t('auth.invalid_token'));
    }

    if (token.usedAt) {
      throw new BadRequestException(this.i18n.t('auth.token_already_used'));
    }

    if (token.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException(this.i18n.t('auth.token_expired'));
    }

    // 2) Update password
    const hashed = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(token.userId, {
      password: hashed,
      id: token.userId,
    });

    // Optional: invalidate all sessions/refresh tokens for this user here

    // 3) Mark token used and invalidate others
    token.usedAt = new Date();
    await this.prRepo.save(token);
    await this.invalidateActiveTokens(token.userId);

    return true;
  }

  private async signPair(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async googleAuth(token: string): Promise<Auth> {
    try {
      let payload: import('google-auth-library').TokenPayload | undefined;
      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: token,
        });

        payload = ticket.getPayload();
      } catch (e) {
        console.error(e);

        // common cause: Wrong recipient (aud mismatch)
        throw new UnauthorizedException(
          this.i18n.t('auth.invalid_google_token'),
        );
      }

      if (!payload?.email) {
        throw new UnauthorizedException(
          this.i18n.t('auth.invalid_google_token'),
        );
      }

      if (!payload.email_verified) {
        throw new UnauthorizedException(
          this.i18n.t('auth.unverified_google_email'),
        );
      }

      if (!payload.sub) {
        throw new UnauthorizedException(
          this.i18n.t('auth.invalid_google_token'),
        );
      }

      // 2) Normalize
      const googleId = payload.sub;
      const email = payload.email.toLowerCase();
      const nameSlug = (payload.name || email.split('@')[0])
        .replace(/\s+/g, '')
        .toLowerCase();
      const picture = payload.picture ?? '';

      // 3) Find/link/create user
      let user = await this.usersService.findByGoogleId(googleId);
      if (!user) {
        const byEmail = await this.usersService.findByEmail(email);
        if (byEmail) {
          // Link Google to an existing account
          byEmail.googleId = byEmail.googleId ?? googleId;
          byEmail.authProvider = IUserAuthProvider.GOOGLE;
          if (!byEmail.emailVerified) {
            byEmail.emailVerified = true;
            byEmail.emailVerifiedAt = new Date();
          }
          if (!byEmail.avatarUrl && picture) byEmail.avatarUrl = picture;
          if (!byEmail.username) byEmail.username = nameSlug;

          user = await this.usersService.create(byEmail);
        } else {
          // Create a new account
          // If password is nullable in your entity, set it to null. Otherwise keep the random hash.
          const randomHash = await bcrypt.hash(randomUUID(), 10);

          user = await this.usersService.create({
            email,
            username: nameSlug,
            password: randomHash, // or null if column is nullable
            bio: '',
            avatarUrl: picture,
            googleId,
            authProvider: IUserAuthProvider.GOOGLE,
            emailVerified: true,
            emailVerifiedAt: new Date(),
          });
        }
      }

      const { accessToken, refreshToken } = await this.signPair(user);

      return { accessToken, refreshToken, user };
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException(
        this.i18n.t('auth.google_authentication_failed'),
      );
    }
  }

  async signup(signupInput: RegisterInput) {
    const existingUser = await this.usersService.findByEmail(signupInput.email);
    if (existingUser)
      throw new ConflictException(this.i18n.t('auth.email_already_in_use'));

    const existingUsername = await this.usersService.findByUsername(
      signupInput.username,
    );
    if (existingUsername)
      throw new ConflictException(this.i18n.t('auth.username_already_in_use'));

    const hashedPassword = await bcrypt.hash(signupInput.password, 10);

    const user = await this.usersService.create({
      ...signupInput,
      password: hashedPassword,
      emailVerified: false,
      emailVerifiedAt: null,
      type: IUserType.PASSENGER,
      avatarUrl: undefined,
    });

    if (signupInput.avatarUrl) {
      // Validate the uploaded temp object exists and is under tmp/avatars
      if (
        !(await this.storage.exists(signupInput.avatarUrl)) ||
        !signupInput.avatarUrl.startsWith('tmp/avatars/')
      ) {
        throw new Error('Invalid avatar upload reference');
      }
      const ext = signupInput.avatarUrl.split('.').pop() || 'jpg';
      const finalKey = `users/${user.id}/avatar.${ext}`;
      await this.storage.move(signupInput.avatarUrl, finalKey);

      await this.usersService.update(user.id, {
        id: user.id,
        avatarUrl: finalKey,
      });

      user.avatarUrl = finalKey;
    }

    await this.sendEmailVerificationLink(user);

    const { accessToken, refreshToken } = await this.signPair(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async signIn(
    email: string,
    password: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const user = await this.usersService.findByEmail(email);
    if (!user)
      throw new UnauthorizedException(this.i18n.t('auth.unauthorized'));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException(this.i18n.t('auth.unauthorized'));

    const { accessToken, refreshToken } = await this.signPair(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(token);

      const { accessToken, refreshToken } = await this.signPair({
        id: payload.sub,
        email: payload.email,
      });

      return {
        accessToken,
        refreshToken,
        user: payload,
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(
        this.i18n.t('auth.invalid_refresh_token'),
      );
    }
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        throw new UnauthorizedException(this.i18n.t('auth.unauthorized'));

      return user;
    }

    return null;
  }
}
