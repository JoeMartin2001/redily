import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { OTPCodeService } from '../otp/otp-code.service';
import { VerifyPhoneInput } from './dto/verify-phone.input';
import { TelegramAuthInput } from './dto/telegram-auth.input';
import { ConfigService } from '@nestjs/config';

@Resolver(() => Auth)
export class AuthResolver {
  private readonly telegramBotToken!: string;

  constructor(
    private readonly authService: AuthService,
    private readonly otpCodeService: OTPCodeService,
    private readonly configService: ConfigService,
  ) {
    this.telegramBotToken =
      this.configService.get<string>('app.telegramBotToken') ?? '';
  }

  // --- External Login (Google/Social) ---
  // This is kept, but the service must now use Supabase's social sign-in methods
  // @Mutation(() => Auth)
  // async googleAuth(@Args('token') token: string): Promise<Auth> {
  //   return await this.authService.googleAuth(token);
  // }

  // --- PHONE OTP FLOW (Eskiz.uz) ---

  // 1. Sends the OTP code via Eskiz.uz and stores it in the database
  @Mutation(() => Boolean)
  async sendPhoneOtp(
    @Args('phoneNumber') phoneNumber: string,
  ): Promise<boolean> {
    // The service handles rate limiting, code generation, and Eskiz.uz API call
    return await this.otpCodeService.generateAndSendOtp(phoneNumber);
  }

  // 2. Verifies the OTP code and uses Supabase to create a user session (JWT)
  @Mutation(() => Auth)
  async verifyPhoneAndLogin(
    @Args('input') input: VerifyPhoneInput,
  ): Promise<Auth> {
    // Step 1: Verify the code is correct and not expired/attempted too many times
    await this.otpCodeService.verifyOtpCode(input.phoneNumber, input.code);

    // Step 2: Use the verified phone to create/sign in the user via Supabase SDK
    // This function returns the Supabase JWT session token.
    const tokens = await this.authService.finalizePhoneAuth(input.phoneNumber);

    // Return the JWT (accessToken) to the client
    return tokens;
  }

  @Mutation(() => Auth)
  async telegramAuth(@Args('input') input: TelegramAuthInput): Promise<Auth> {
    return await this.authService.finalizeTelegramAuth(input);
  }
}
