# ecs service creation
resource "aws_ecs_service" "slasher-web-new-service" {
  name                   = "slasher-web-new-service-${terraform.workspace}"
  cluster                = "ecs-fargate-cluster-${terraform.workspace}"
  task_definition        = aws_ecs_task_definition.slasher-web-task-new-defination.id
  desired_count          = var.web_new_desired_count
  launch_type            = "FARGATE"
  platform_version       = "LATEST"
  enable_execute_command = true
  depends_on             = [aws_iam_role_policy_attachment.ecs-task-execution-role-policy-attachment]
  network_configuration {
    subnets         = [data.aws_ssm_parameter.pri_subnet1.value, data.aws_ssm_parameter.pri_subnet2.value]
    security_groups = [data.aws_ssm_parameter.sg_ecs.value]
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.target-group-slasher-web-app-new.arn
    container_name   = "app-new-slasher-${terraform.workspace}"
    container_port   = 4000
  }
  lifecycle {
    ignore_changes = [task_definition] #added task definition in lifecycle block to ignore changes while deploying terraform
  }
}

resource "aws_cloudwatch_log_group" "slasher-web-new-log-group" {
  name              = "/ecs-cluster/slasher-web-new-log-group-${terraform.workspace}"
  retention_in_days = var.log_group_retention_in_days
  tags = {
    env     = terraform.workspace
    service = "slasher-web-new"
  }
}

# Task defination
resource "aws_ecs_task_definition" "slasher-web-task-new-defination" {
  family                   = "slasher-web-new-task-defination-${terraform.workspace}"
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  network_mode             = "awsvpc"
  cpu                      = var.web_new_cpu_unit
  memory                   = var.web_new_memory_unit
  requires_compatibilities = ["FARGATE"]
  container_definitions    = <<DEFINITION
[
{
    "image": "${aws_ecr_repository.ecr_repo_slasher-web-new.repository_url}:latest",
    "name": "app-new-slasher-${terraform.workspace}",
    "environment": [
      {
        "name" : "PORT",
        "value" : "4000"
      },
      {
        "name" : "API_URL",
        "value" : "${var.api_url}"
      },
      {
        "name" : "CRON_ENABLED",
        "value" : "false"
      },
      {
        "name" : "DEFAULT_SMTP_HOST",
        "value" : "mail.slasher.tv"
      },
      {
        "name" : "DEFAULT_SMTP_PORT",
        "value" : "465"
      },
      {
        "name" : "REPORT_EMAIL_RECIPIENT",
        "value" : "test@slasher.tv"
      },
      {
        "name" : "HELP_EMAIL",
        "value" : "help@slasher.tv"
      },
      {
        "name" : "UPLOAD_DIR",
        "value" : "/tmp"
      },
      {
        "name" : "STORAGE_LOCATION_GENERATOR_PREFIX",
        "value" : "/staging"
      },
      {
        "name" : "FILE_STORAGE",
        "value" : "s3"
      },
      {
        "name" : "S3_REGION",
        "value" : "us-east-1"
      },
      {
        "name" : "FRONTEND_URL",
        "value" : "${var.frontend_url}"
      }
    ],
    "secrets":[
      {
        "name" : "DEFAULT_SMTP_AUTH_USER",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/DEFAULT_SMTP_AUTH_USER_WEB_NEW"
      },
      {
        "name" : "DEFAULT_SMTP_AUTH_PASS",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/DEFAULT_SMTP_AUTH_PASS_WEB_NEW"
      },
      {
        "name" : "MOVIE_DB_API_KEY",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/MOVIE_DB_API_KEY_WEB_NEW"
      },
      {
        "name" : "JWT_SECRET_KEY",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/JWT_SECRET_KEY_WEB_NEW"
      },
      {
        "name" : "DB_CONNECTION_URL",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/DB_CONNECTION_URL_WEB_NEW"
      },
      {
        "name" : "S3_USER_ACCESS_KEY_ID",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/S3_USER_ACCESS_KEY_ID_WEB_NEW"
      },
      {
        "name" : "S3_USER_SECRET_ACCESS_KEY",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/S3_USER_SECRET_ACCESS_KEY_ID_WEB_NEW"
      },
      {
        "name" : "S3_BUCKET",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/S3_BUCKET"
      },
      {
        "name" : "S3_HOST",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/S3_HOST"
      },
      {
        "name" : "REDIS_HOST",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/REDIS_HOST_WEB_NEW"
      },
      {
        "name" : "REDIS_PORT",
        "valueFrom" : "/ECS-CLUSTER/slasher-${terraform.workspace}/REDIS_PORT"
      }
    ],
    "essential": true,
    "mountPoints": [],
    "volumesFrom": [],
    "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
            "awslogs-region" : "us-east-1",
            "awslogs-group" : "${aws_cloudwatch_log_group.slasher-web-new-log-group.name}",
            "awslogs-stream-prefix" : "app-slasher-web"
        }
    },
    "portMappings": [
        {
          "containerPort": 4000,
          "hostPort": 4000,
          "protocol":"tcp"
        }
    ],
    "linuxParameters": {
          "initProcessEnabled": true
    }
  }
]
DEFINITION
}
