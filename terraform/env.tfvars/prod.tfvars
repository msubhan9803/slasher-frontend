AWSRegion = "us-east-1"

#ecs-fargate
web_new_min_capacity        = 2
web_new_max_capacity        = 3
web_new_desired_count       = 2
web_new_cpu_unit            = 1024
web_new_memory_unit         = 2048
cron_desired_count          = 1
cron_cpu_unit               = 256
cron_memory_unit            = 512
api_url                     = "https://api.slasher.tv"
frontend_url                = "https://www.slasher.tv"
log_group_retention_in_days = 60
slasher_web_new_host_header = "api.slasher.tv"
slasher_cron_host_header    = "cron.slasher.tv"

#ecs fargate env variables
upload_dir                        = "/tmp"
help_email                        = "help@slasher.tv"
event_review_email                = "events@slasher.tv"
report_email_recipient            = "help@slasher.tv"
default_smtp_port                 = "465"
default_smtp_host                 = "mail.slasher.tv"
file_storage                      = "s3"
cron_enabled_web                  = false # for web cron is disabled
storage_location_generator_prefix = "/"
# User id below is Damon's user id
welcome_message_sender_user_id    = "5cf146426038e206a2fe681b"
send_push_notification            = true
log_level                         = "warn"

cron_enabled_cron                 = true # for cron service the cron is enabled
