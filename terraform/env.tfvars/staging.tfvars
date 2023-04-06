AWSRegion = "us-east-1"

#ecs-fargate
web_new_desired_count       = 1
web_new_cpu_unit            = 512
web_new_memory_unit         = 1024
web_new_min_capacity        = 1
web_new_max_capacity        = 1
cron_desired_count          = 1
cron_cpu_unit               = 512
cron_memory_unit            = 1024
api_url                     = "https://api-staging.slasher.tv"
frontend_url                = "https://staging.slasher.tv"
log_group_retention_in_days = 60
slasher_web_new_host_header = "api-staging.slasher.tv"
slasher_cron_host_header    = "cron-staging.slasher.tv"