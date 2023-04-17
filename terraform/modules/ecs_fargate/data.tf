data "aws_ssm_parameter" "vpc_id" {
  name = "/ECS_CLUSTER/slasher-${terraform.workspace}/VPC_ID"
}

data "aws_ssm_parameter" "pub_subnet1" {
  name = "/ECS_CLUSTER/slasher-${terraform.workspace}/PUBLIC_SUBNET_1"
}

data "aws_ssm_parameter" "pub_subnet2" {
  name = "/ECS_CLUSTER/slasher-${terraform.workspace}/PUBLIC_SUBNET_2"
}

data "aws_ssm_parameter" "pri_subnet1" {
  name = "/ECS_CLUSTER/slasher-${terraform.workspace}/PRIVATE_SUBNET_1"
}

data "aws_ssm_parameter" "pri_subnet2" {
  name = "/ECS_CLUSTER/slasher-${terraform.workspace}/PRIVATE_SUBNET_2"
}

data "aws_ssm_parameter" "sg_alb" {
  name = "/ECS_CLUSTER/slasher-${terraform.workspace}/SG_ALB"
}

data "aws_ssm_parameter" "sg_ecs" {
  name = "/ECS_CLUSTER/slasher-${terraform.workspace}/SG_ECS"
}

data "aws_ssm_parameter" "acm_cert_arn" {
  name = "/ECS_CLUSTER/slasher-${terraform.workspace}/ACM_CERT_ARN"
}

data "aws_lb" "lb-ecs-fargate" {
  name = "lb-ecs-fargate-${terraform.workspace}"
}

data "aws_lb_listener" "ecs_alb_listener_arn" {
  load_balancer_arn = data.aws_lb.lb-ecs-fargate.arn
  port              = "443"
}