project_id   = "ridely-staging"
region       = "europe-central2"
service_name = "ridely-api-staging"
image        = "europe-central2-docker.pkg.dev/ridely-staging/ridely-staging/ridely-api:latest"

# Non-sensitive environment variables
env_vars = {
  # Database
  DB_USER     = "postgres.dbunxvmwjytgxdnslymd"
  DB_NAME     = "postgres"
  DB_SSL      = "true"

  # Supabase - URL-encoded password: test-password -> test-password
  SUPABASE_URL          = "https://dbunxvmwjytgxdnslymd.supabase.co"

  # Language
  FALLBACK_LANGUAGE = "en"

  # Google OAuth
  GOOGLE_REDIRECT_URL = "https://staging.ridely.uz/auth/google/callback"

  # OTP Provider (eskiz or email)
  OTP_PROVIDER = "eskiz"

  # Eskiz SMS
  ESKIZ_EMAIL         = "sardorkhayitboyev2001@gmail.com"
  ESKIZ_EMAIL_ADDRESS = "sardorkhayitboyev2001@gmail.com"

  # Gmail
  GMAIL_USER = "sardorkhayitboyev2001@gmail.com"

  # S3/MinIO (dummy for staging - no file uploads)
  S3_ENDPOINT          = "https://s3.amazonaws.com"
  S3_PUBLIC_ENDPOINT   = "https://s3.amazonaws.com"
  S3_PUBLIC_BASE_URL   = "https://s3.amazonaws.com/ridely"
  S3_PORT              = "443"
  S3_USE_SSL           = "true"
  S3_BUCKET            = "ridely"
  S3_KEY               = "minio"
  S3_REGION            = "us-east-1"
  S3_FORCE_PATH_STYLE  = "false"

  # MinIO (not used in staging, but required by validation)

  # Prometheus & Loki (not used in Cloud Run)
  PROMETHEUS_UID = "df2roje6iu58gf"
  LOKI_UID       = "P8E80F9AEF21F6940"

  # Redis - Sidecar (localhost)
  REDIS_HOST = "localhost"
  REDIS_PORT = "6379"
  REDIS_URL  = "redis://localhost:6379"
}
