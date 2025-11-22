variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "europe-central2"
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
  default     = "ridely-api"
}

variable "image" {
  description = "Container image for Cloud Run"
  type        = string
}

variable "env_vars" {
  description = "Environment variables for the application"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secret values to store in Secret Manager"
  type        = map(string)
  sensitive   = true
  default     = {}
}
