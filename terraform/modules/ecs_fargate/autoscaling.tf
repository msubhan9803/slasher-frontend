resource "aws_appautoscaling_target" "slasher-web-new-auto-scaling-target" {
  service_namespace  = "ecs"
  resource_id        = "service/ecs-fargate-cluster-${terraform.workspace}/${aws_ecs_service.slasher-web-new-service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.web_new_min_capacity
  max_capacity       = var.web_new_max_capacity
}

# Automatically scale capacity up by one
resource "aws_appautoscaling_policy" "slasher-web-new-up" {
  name               = "slasher-web-new-up-${terraform.workspace}"
  service_namespace  = "ecs"
  resource_id        = "service/ecs-fargate-cluster-${terraform.workspace}/${aws_ecs_service.slasher-web-new-service.name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_lower_bound = 0
      scaling_adjustment          = 1
    }
  }

  depends_on = [aws_appautoscaling_target.slasher-web-new-auto-scaling-target]
}

# Automatically scale capacity down by one
resource "aws_appautoscaling_policy" "slasher-web-new-down" {
  name               = "slasher-web-new-down-${terraform.workspace}"
  service_namespace  = "ecs"
  resource_id        = "service/ecs-fargate-cluster-${terraform.workspace}/${aws_ecs_service.slasher-web-new-service.name}"
  scalable_dimension = "ecs:service:DesiredCount"

  step_scaling_policy_configuration {
    adjustment_type         = "ChangeInCapacity"
    cooldown                = 60
    metric_aggregation_type = "Maximum"

    step_adjustment {
      metric_interval_upper_bound = 0
      scaling_adjustment          = -1
    }
  }

  depends_on = [aws_appautoscaling_target.slasher-web-new-auto-scaling-target]
}

# CloudWatch alarm that triggers the autoscaling up policy
resource "aws_cloudwatch_metric_alarm" "slasher-web-service-new_cpu_high" {
  alarm_name          = "slasher-web-new-ecs-cpu-utilization-high-${terraform.workspace}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "70"

  dimensions = {
    ClusterName = "ecs-fargate-cluster-${terraform.workspace}"
    ServiceName = aws_ecs_service.slasher-web-new-service.name
  }

  alarm_actions = [aws_appautoscaling_policy.slasher-web-new-up.arn]
}

# CloudWatch alarm that triggers the autoscaling down policy
resource "aws_cloudwatch_metric_alarm" "slasher-web-service-new_cpu_low" {
  alarm_name          = "slasher-web-new-ecs-cpu-utilization-low-${terraform.workspace}"
  comparison_operator = "LessThanOrEqualToThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = "60"
  statistic           = "Average"
  threshold           = "10"

  dimensions = {
    ClusterName = "ecs-fargate-cluster-${terraform.workspace}"
    ServiceName = aws_ecs_service.slasher-web-new-service.name
  }

  alarm_actions = [aws_appautoscaling_policy.slasher-web-new-down.arn]
}