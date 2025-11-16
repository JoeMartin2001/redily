import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { IUserAuthProvider, IUserType } from 'src/common/interfaces/User';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { RegisterInput } from './dto/register.input';
import { StorageService } from 'src/infra/storage/storage.service';
import { SupabaseService } from 'src/infra/supabase/supabase.service';
import { TelegramAuthInput } from './dto/telegram-auth.input';
import { Auth } from './entities/auth.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;
  private readonly FRONTEND_URL: string;
  private readonly supabasePhoneSecret: string;

  constructor(
    private readonly usersService: UserService,
    private readonly configService: ConfigService,
    private readonly storage: StorageService,
    private readonly supabaseService: SupabaseService,
    private readonly i18n: I18nService,
  ) {
    this.googleClient = new OAuth2Client(
      this.configService.get('app.googleClientId'),
    );

    this.FRONTEND_URL = this.configService.get<string>('app.frontendUrl') ?? '';

    this.supabasePhoneSecret =
      this.configService.get<string>('app.supabasePhoneSecret') ?? '';

    this.logger.log(this.FRONTEND_URL);
    this.logger.log(this.supabasePhoneSecret);
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
  }

  async finalizePhoneAuth(phone: string) {
    this.logger.log(`Attempting to finalize auth for phone: ${phone}`);

    const supabaseAdmin = this.supabaseService.getAdminClient();

    const sanitizedPhone = phone.replace(/[^0-9]/g, '');

    // 1. Supabase Workaround: Use a placeholder email and a temporary secure password.
    // This is necessary because Supabase Auth (GoTrue) is primarily email/password based.
    const placeholderEmail = `${sanitizedPhone}@ridely.uz`;
    const tempPassword = crypto
      .createHash('sha256')
      .update(`${phone}:${this.supabasePhoneSecret}`)
      .digest('hex');

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    // Ensure we track the platform user account
    let appUser = await this.usersService.findByEmail(placeholderEmail);

    // --- 1. Try to Sign In the Existing User ---
    try {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: placeholderEmail,
        password: tempPassword,
      });

      if (data?.session?.access_token) {
        this.logger.log(`Sign-in successful for existing user: ${phone}`);
        accessToken = data.session.access_token;
        refreshToken = data.session.refresh_token;
      } else if (error && error.message.includes('Invalid login credentials')) {
        // User does not exist, proceed to signup attempt.
        this.logger.log(
          `User not found with placeholder email for ${phone}. Proceeding to sign-up.`,
        );
      } else if (error) {
        this.logger.error(`Sign-in error for ${phone}: ${error.message}`);
        throw new InternalServerErrorException(
          this.i18n.t('auth.authentication_error', {
            args: { message: error.message },
          }),
        );
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';

      this.logger.error(
        `Unexpected sign-in exception for ${phone}: ${errorMessage}`,
      );
    }

    // --- 2. If Sign In Failed, Attempt to Sign Up the New User ---
    if (!accessToken) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: placeholderEmail,
          password: tempPassword,
          phone,
          email_confirm: true,
          phone_confirm: true,
          user_metadata: {
            phone_number: phone,
          },
        });

        if (error) {
          this.logger.error(`Sign-up error for ${phone}: ${error.message}`);
          throw new InternalServerErrorException(
            this.i18n.t('auth.registration_error', {
              args: { message: error.message },
            }),
          );
        }

        if (data?.user?.id) {
          const { data: signInData, error: signInError } =
            await supabaseAdmin.auth.signInWithPassword({
              email: placeholderEmail,
              password: tempPassword,
            });

          if (signInData?.session?.access_token) {
            this.logger.log(`Sign-up successful for new user: ${phone}`);
            accessToken = signInData.session.access_token;
            refreshToken = signInData.session.refresh_token;
          } else if (signInError) {
            this.logger.error(
              `Post sign-up sign-in error for ${phone}: ${signInError.message}`,
            );
            throw new InternalServerErrorException(
              this.i18n.t('auth.authentication_error', {
                args: { message: signInError.message },
              }),
            );
          }
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'Unknown error';

        this.logger.error(
          `Unexpected sign-up exception for ${phone}: ${errorMessage}`,
        );

        throw new InternalServerErrorException(
          this.i18n.t('auth.unexpected_registration_error'),
        );
      }
    }

    if (!appUser) {
      const username = `ridely_${sanitizedPhone}`.slice(0, 30);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      try {
        appUser = await this.usersService.create({
          email: placeholderEmail,
          username,
          phoneNumber: phone,
          password: hashedPassword,
          type: IUserType.PASSENGER,
          authProvider: IUserAuthProvider.PHONE,
          emailVerified: true,
          emailVerifiedAt: new Date(),
        });
      } catch (error) {
        this.logger.error(
          `Failed to create local user for phone ${phone}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        );
        throw new InternalServerErrorException(
          this.i18n.t('auth.failed_to_complete_auth'),
        );
      }
    } else if (!appUser.phoneNumber) {
      await this.usersService.update(appUser.id, {
        id: appUser.id,
        phoneNumber: phone,
      });
      appUser.phoneNumber = phone;
    }

    if (!accessToken) {
      this.logger.error(`Failed to acquire access token for phone: ${phone}`);

      throw new InternalServerErrorException(
        this.i18n.t('auth.failed_to_complete_auth'),
      );
    }

    return { accessToken, refreshToken, user: appUser };
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

  verifyTelegram(input: TelegramAuthInput, botToken: string): boolean {
    const { hash, ...data } = input;

    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    const checkString = Object.keys(data)
      .sort()
      .map((key) => `${key}=${data[key]}`)
      .join('\n');

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(checkString)
      .digest('hex');

    return computedHash === hash;
  }

  async finalizeTelegramAuth(input: TelegramAuthInput): Promise<Auth> {
    this.logger.log(`Attempting Telegram auth for user: ${input.id}`);

    const supabaseAdmin = this.supabaseService.getAdminClient();

    // 1. Verify Telegram signature
    const isValid = this.verifyTelegram(
      input,
      this.configService.get<string>('app.telegramBotToken') ?? '',
    );
    if (!isValid) {
      this.logger.warn(`Telegram hash verification failed for: ${input.id}`);
      throw new UnauthorizedException(
        'Invalid Telegram authentication payload',
      );
    }

    // 2. Create placeholder email + deterministic internal password
    const placeholderEmail = `telegram_${input.id}@ridely.uz`;

    const tempPassword = crypto
      .createHash('sha256')
      .update(
        `${input.id}:${this.configService.get<string>('app.supabaseTelegramSecret') ?? ''}`,
      )
      .digest('hex');

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    // --- 1. Try to sign in existing user ---
    try {
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email: placeholderEmail,
        password: tempPassword,
      });

      if (data?.session?.access_token) {
        this.logger.log(`Telegram sign-in successful for: ${input.username}`);
        accessToken = data.session.access_token;
        refreshToken = data.session.refresh_token;
      } else if (error?.message.includes('Invalid login credentials')) {
        this.logger.log(
          `Telegram user not found, proceeding with sign-up: ${input.username}`,
        );
      } else if (error) {
        this.logger.error(`Telegram sign-in error: ${error.message}`);
        throw new InternalServerErrorException(
          this.i18n.t('auth.authentication_error', {
            args: { message: error.message },
          }),
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(
        `Unexpected Telegram login exception (sign-in): ${msg}`,
      );
    }

    // --- 2. If sign in failed -> sign up new user ---
    if (!accessToken) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: placeholderEmail,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            telegram_id: input.id,
            username: input.username,
            first_name: input.first_name,
            last_name: input.last_name,
            photo_url: input.photo_url,
            provider: 'telegram',
          },
        });

        if (error) {
          this.logger.error(`Telegram sign-up error: ${error.message}`);
          throw new InternalServerErrorException(
            this.i18n.t('auth.registration_error', {
              args: { message: error.message },
            }),
          );
        }

        // Sign-in newly created user
        if (data?.user) {
          const { data: signInData, error: signInErr } =
            await supabaseAdmin.auth.signInWithPassword({
              email: placeholderEmail,
              password: tempPassword,
            });

          if (signInData?.session?.access_token) {
            this.logger.log(
              `Telegram sign-up successful for: ${input.username}`,
            );
            accessToken = signInData.session.access_token;
            refreshToken = signInData.session.refresh_token;
          } else if (signInErr) {
            this.logger.error(
              `Telegram post sign-up sign-in error: ${signInErr.message}`,
            );
            throw new InternalServerErrorException(
              this.i18n.t('auth.authentication_error', {
                args: { message: signInErr.message },
              }),
            );
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(`Unexpected Telegram sign-up exception: ${msg}`);

        throw new InternalServerErrorException(
          this.i18n.t('auth.unexpected_registration_error'),
        );
      }
    }

    // --- 3. Return session to client ---
    return {
      accessToken: accessToken ?? '',
      refreshToken: refreshToken ?? '',
      user: undefined,
    };
  }
}
