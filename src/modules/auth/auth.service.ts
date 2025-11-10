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
import { IUserType } from 'src/common/interfaces/User';
import { ConfigService } from '@nestjs/config';
import { I18nService } from 'nestjs-i18n';
import { RegisterInput } from './dto/register.input';
import { StorageService } from 'src/infra/storage/storage.service';
import { SupabaseService } from 'src/infra/supabase/supabase.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client;
  private readonly FRONTEND_URL: string;

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

    this.FRONTEND_URL =
      this.configService.get<string>('app.frontendUrl') ??
      'http://localhost:3001';
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

    // 1. Supabase Workaround: Use a placeholder email and a temporary secure password.
    // This is necessary because Supabase Auth (GoTrue) is primarily email/password based.
    const placeholderEmail = `${phone.replace(/[^0-9]/g, '')}@blablacar.uz`;
    const tempPassword = crypto.randomBytes(16).toString('hex');

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

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
        const { data, error } = await supabaseAdmin.auth.signUp({
          email: placeholderEmail,
          password: tempPassword,
          phone: phone,
          options: {
            data: {
              phone_number: phone,
            },
          },
        });

        if (data?.session?.access_token) {
          this.logger.log(`Sign-up successful for new user: ${phone}`);
          accessToken = data.session.access_token;
          refreshToken = data.session.refresh_token;
        } else if (error) {
          this.logger.error(`Sign-up error for ${phone}: ${error.message}`);
          throw new InternalServerErrorException(
            this.i18n.t('auth.registration_error', {
              args: { message: error.message },
            }),
          );
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

    if (!accessToken) {
      this.logger.error(`Failed to acquire access token for phone: ${phone}`);

      throw new InternalServerErrorException(
        this.i18n.t('auth.failed_to_complete_auth'),
      );
    }

    return { accessToken, refreshToken };
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
