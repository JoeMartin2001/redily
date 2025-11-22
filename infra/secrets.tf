# Secrets Management for Cloud Run
# This file defines secrets in Google Secret Manager and grants access to Cloud Run

# Define all secrets
locals {
  secret_names = [
    "jwt-secret",
    "jwt-expires-in",
    "google-client-secret",
    "supabase-service-role-key",
    "supabase-phone-secret",
    "supabase-telegram-secret",
    "supabase-database-password",
    "db-password",
    "eskiz-password",
    "gmail-pass",
    "openai-api-key",
    "gemini-api-key",
    "s3-secret",
    "telegram-bot-token",
  ]
}

# Create secrets in Secret Manager
resource "google_secret_manager_secret" "secrets" {
  for_each = toset(local.secret_names)

  secret_id = each.value
  project   = var.project_id

  replication {
    auto {}
  }
}

# Create secret versions with values from variable
resource "google_secret_manager_secret_version" "secret_versions" {
  for_each = nonsensitive(toset(keys(var.secrets)))

  secret      = google_secret_manager_secret.secrets[each.key].id
  secret_data = var.secrets[each.key]
}

# Grant Cloud Run service account access to secrets
resource "google_secret_manager_secret_iam_member" "cloud_run_access" {
  for_each = toset(local.secret_names)

  secret_id = google_secret_manager_secret.secrets[each.key].id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

# Get project number for service account
data "google_project" "project" {
  project_id = var.project_id
}
