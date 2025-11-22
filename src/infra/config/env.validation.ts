import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsString,
  IsBooleanString,
  IsOptional,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum OtpProviderEnum {
  Eskiz = 'eskiz',
  Email = 'email',
}

export enum Environment {
  Development = 'development',
  Local = 'local',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  // ───── Core App Config ─────
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsOptional()
  @IsBooleanString()
  RUN_MIGRATIONS!: string;

  @IsNumber()
  @Min(0)
  @Max(65535)
  PORT!: number;

  @IsString()
  FRONTEND_URL!: string;

  // ───── Security ─────
  @IsString()
  JWT_SECRET!: string;

  @IsString()
  JWT_EXPIRES_IN!: string; // e.g. "1d", "3600s"

  // ───── Database ─────
  @IsString()
  DB_HOST!: string;

  @IsNumber()
  DB_PORT!: number;

  @IsString()
  DB_USER!: string;

  @IsString()
  DB_PASSWORD!: string;

  @IsString()
  DB_NAME!: string;

  @IsBooleanString()
  DB_SSL!: string; // "true" | "false"

  // ───── AI Provider (optional) ─────
  @IsOptional()
  @IsString()
  OPENAI_API_KEY!: string;

  // ───── Google ─────
  @IsString()
  GOOGLE_CLIENT_ID!: string;

  @IsString()
  GOOGLE_CLIENT_SECRET!: string;

  @IsString()
  GOOGLE_REDIRECT_URL!: string;

  // ───── Gmail ─────
  @IsString()
  GMAIL_USER!: string;

  @IsString()
  GMAIL_PASS!: string;

  // ───── I18n ─────
  @IsString()
  FALLBACK_LANGUAGE!: string;

  // ───── S3 ─────
  @IsString()
  S3_BUCKET!: string;

  @IsString()
  S3_ENDPOINT!: string;

  @IsString()
  S3_REGION!: string;

  @IsString()
  S3_KEY!: string;

  @IsString()
  S3_SECRET!: string;

  @IsBooleanString()
  S3_FORCE_PATH_STYLE!: string;

  @IsString()
  S3_PUBLIC_BASE_URL!: string;

  // ───── MinIO ─────
  @IsString()
  MINIO_ROOT_USER!: string;

  @IsString()
  MINIO_ROOT_PASSWORD!: string;

  // ───── Supabase ─────
  @IsString()
  SUPABASE_URL!: string;

  @IsString()
  SUPABASE_SERVICE_ROLE_KEY!: string;

  @IsString()
  SUPABASE_DATABASE_URL!: string;

  @IsString()
  SUPABASE_PHONE_SECRET!: string;

  // ───── Eskiz ─────
  @IsString()
  ESKIZ_EMAIL_ADDRESS!: string;

  @IsString()
  ESKIZ_PASSWORD!: string;

  // ───── OTP Provider ─────
  @IsEnum(OtpProviderEnum, {
    message: 'OTP_PROVIDER must be a valid OTP provider',
  })
  OTP_PROVIDER!: OtpProviderEnum;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // converts strings → numbers/booleans
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false, // fail if anything required is missing
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
