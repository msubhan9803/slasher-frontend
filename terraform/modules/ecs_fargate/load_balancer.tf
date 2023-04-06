resource "aws_lb_target_group" "target-group-slasher-web-app-new" {
  name                 = "slasher-web-new-tg-${terraform.workspace}"
  port                 = 4000
  protocol             = "HTTP"
  deregistration_delay = 180
  vpc_id               = data.aws_ssm_parameter.vpc_id.value
  target_type          = "ip"
  lifecycle {
    create_before_destroy = true
  }
  health_check {
    enabled             = true
    healthy_threshold   = 3
    interval            = 20
    timeout             = 10
    path                = "/health-check"
    unhealthy_threshold = 10
    matcher             = "200,401,404"
  }
}

resource "aws_lb_target_group" "target-group-slasher-cron" {
  name                 = "slasher-cron-tg-${terraform.workspace}"
  port                 = 4000
  protocol             = "HTTP"
  deregistration_delay = 180
  vpc_id               = data.aws_ssm_parameter.vpc_id.value
  target_type          = "ip"
  lifecycle {
    create_before_destroy = true
  }
  health_check {
    enabled             = true
    healthy_threshold   = 3
    interval            = 20
    timeout             = 10
    path                = "/health-check"
    unhealthy_threshold = 10
    matcher             = "200,401,404"
  }
}

resource "aws_lb_listener_rule" "slasher-web-listener-rule" {
  listener_arn = data.aws_lb_listener.ecs_alb_listener_arn.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target-group-slasher-web-app-new.arn
  }

  condition {
    host_header {
      values = ["${var.slasher_web_new_host_header}"]
    }
  }
}

resource "aws_lb_listener_rule" "slasher-cron-listener-rule" {
  listener_arn = data.aws_lb_listener.ecs_alb_listener_arn.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.target-group-slasher-cron.arn
  }

  condition {
    host_header {
      values = ["${var.slasher_cron_host_header}"]
    }
  }
}