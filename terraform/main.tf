module "ecs_fargate" {
  source                      = "./modules/ecs_fargate"
  web_new_desired_count       = var.web_new_desired_count
  web_new_cpu_unit            = var.web_new_cpu_unit
  web_new_memory_unit         = var.web_new_memory_unit
  web_new_min_capacity        = var.web_new_min_capacity
  web_new_max_capacity        = var.web_new_max_capacity
  cron_desired_count          = var.cron_desired_count
  cron_cpu_unit               = var.cron_cpu_unit
  cron_memory_unit            = var.cron_memory_unit
  api_url                     = var.api_url
  frontend_url                = var.frontend_url
  log_group_retention_in_days = var.log_group_retention_in_days
  slasher_web_new_host_header = var.slasher_web_new_host_header
  slasher_cron_host_header    = var.slasher_cron_host_header
}
