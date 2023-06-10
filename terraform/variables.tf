variable "AWSRegion" {
  default     = "us-east-1"
  description = "AWS region where application resources will get deployed"
}

variable "web_new_desired_count" {}
variable "web_new_cpu_unit" {}
variable "web_new_memory_unit" {}
variable "web_new_min_capacity" {}
variable "web_new_max_capacity" {}

variable "cron_desired_count" {}
variable "cron_cpu_unit" {}
variable "cron_memory_unit" {}

variable "api_url" {}
variable "frontend_url" {}

variable "log_group_retention_in_days" {}

variable "slasher_web_new_host_header" {}
variable "slasher_cron_host_header" {}

variable "upload_dir" {}
variable "help_email" {}
variable "event_review_email" {}
variable "report_email_recipient" {}
variable "default_smtp_port" {}
variable "default_smtp_host" {}
variable "file_storage" {}
variable "cron_enabled_cron" {}
variable "cron_enabled_web" {}
variable "storage_location_generator_prefix" {}
variable "welcome_message_sender_user_id" {}
variable "send_push_notification" {}
