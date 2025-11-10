import { registerAs } from '@nestjs/config';
import { Environment } from './env.validation';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || Environment.Development,
  port: parseInt(process.env.PORT ?? '3000', 10),

  // Security
  jwtSecret: process.env.JWT_SECRET || 'changeme',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',

  // OpenAI / AI provider (for question generation)
  openAiApiKey: process.env.OPENAI_API_KEY,

  // Google
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRedirectUrl: process.env.GOOGLE_REDIRECT_URL,

  // Gmail
  gmailUser: process.env.GMAIL_USER,
  gmailPass: process.env.GMAIL_PASS,

  // Other configs you might need later
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  // Swagger
  apiUrl: process.env.API_URL || `http://localhost:${process.env.PORT ?? 3000}`,
  prodApiUrl: process.env.PROD_API_URL || 'https://api.monolingo.ai',

  // I18n
  fallbackLanguage: process.env.FALLBACK_LANGUAGE || 'en',

  // S3
  s3Bucket: process.env.S3_BUCKET,
  s3Endpoint: process.env.S3_ENDPOINT,
  s3PublicEndpoint: process.env.S3_PUBLIC_ENDPOINT,
  s3Region: process.env.S3_REGION,
  s3Key: process.env.S3_KEY,
  s3Secret: process.env.S3_SECRET,
  s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE,
  s3PublicBaseUrl: process.env.S3_PUBLIC_BASE_URL,

  // MinIO
  minioRootUser: process.env.MINIO_ROOT_USER,
  minioRootPassword: process.env.MINIO_ROOT_PASSWORD,

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // Eskiz
  eskizEmailAddress: process.env.ESKIZ_EMAIL_ADDRESS,
  eskizPassword: process.env.ESKIZ_PASSWORD,
}));
