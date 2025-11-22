resource "google_cloud_run_v2_service" "api" {
  name     = var.service_name
  location = var.region

  template {
    containers {
      image = var.image

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "1Gi"
        }
      }

      # Non-secret environment variables
      env {
        name  = "APP_ENV"
        value = "staging"
      }

      env {
        name  = "NODE_ENV"
        value = "production"
      }

      env {
        name  = "FRONTEND_URL"
        value = "https://staging.ridely.uz"
      }

      # Dynamic non-secret env vars from staging.tfvars
      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      # JWT Secret
      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["jwt-secret"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "JWT_EXPIRES_IN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["jwt-expires-in"].secret_id
            version = "latest"
          }
        }
      }

      # Google OAuth
      env {
        name = "GOOGLE_CLIENT_ID"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["google-client-id"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "GOOGLE_CLIENT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["google-client-secret"].secret_id
            version = "latest"
          }
        }
      }

      # Supabase
      env {
        name = "SUPABASE_SERVICE_ROLE_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["supabase-service-role-key"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "SUPABASE_PHONE_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["supabase-phone-secret"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "SUPABASE_TELEGRAM_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["supabase-telegram-secret"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "SUPABASE_DATABASE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["supabase-database-password"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "SUPABASE_DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["supabase-database-url"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "DB_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["db-password"].secret_id
            version = "latest"
          }
        }
      }

      # Eskiz
      env {
        name = "ESKIZ_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["eskiz-password"].secret_id
            version = "latest"
          }
        }
      }

      # Gmail
      env {
        name = "GMAIL_PASS"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["gmail-pass"].secret_id
            version = "latest"
          }
        }
      }

      # AI APIs
      env {
        name = "OPENAI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["openai-api-key"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "GEMINI_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["gemini-api-key"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "DB_HOST"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["db-host"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "DB_PORT"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["db-port"].secret_id
            version = "latest"
          }
        }
      }

      # S3/MinIO
      env {
        name = "MINIO_ROOT_USER"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["minio-root-user"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "MINIO_ROOT_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["minio-root-password"].secret_id
            version = "latest"
          }
        }
      }

      env {
        name = "S3_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["s3-secret"].secret_id
            version = "latest"
          }
        }
      }

      # Telegram
      env {
        name = "TELEGRAM_BOT_TOKEN"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.secrets["telegram-bot-token"].secret_id
            version = "latest"
          }
        }
      }
    }

    containers {
      image = "redis:alpine"
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 5
    }
  }

  ingress = "INGRESS_TRAFFIC_ALL"

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  depends_on = [
    google_secret_manager_secret_version.secret_versions
  ]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
