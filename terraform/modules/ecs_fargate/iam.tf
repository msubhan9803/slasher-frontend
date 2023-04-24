resource "aws_iam_role" "ecs_task_execution_role" {
  name = "execution-role-task-slasher-web-new-${terraform.workspace}"

  assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "ecs-tasks.amazonaws.com"
     },
     "Effect": "Allow"
   }
 ]
}
EOF

  inline_policy {
    name = "SSS-get-parameter-policy"
    policy = jsonencode(
      {
        Statement = [
          {
            Action = [
              "ssm:GetParameters"
            ]
            Effect   = "Allow"
            Resource = "*"
          },
        ]
        Version = "2012-10-17"
      }
    )
  }
}

resource "aws_iam_role" "ecs_task_role" {
  name = "role-task-slasher-web-new-${terraform.workspace}"

  assume_role_policy = <<EOF
{
 "Version": "2012-10-17",
 "Statement": [
   {
     "Action": "sts:AssumeRole",
     "Principal": {
       "Service": "ecs-tasks.amazonaws.com"
     },
     "Effect": "Allow",
     "Sid": ""
   }
 ]
}
EOF

  inline_policy {
    name = "ECS-exec-permission-policy"
    policy = jsonencode(
      {
        Statement = [
          {
            Action = [
              "ssmmessages:CreateControlChannel",
              "ssmmessages:CreateDataChannel",
              "ssmmessages:OpenControlChannel",
              "ssmmessages:OpenDataChannel"
            ]
            Effect   = "Allow"
            Resource = "*"
          },
        ]
        Version = "2012-10-17"
      }
    )
  }
}

resource "aws_iam_role_policy_attachment" "ecs-task-execution-role-policy-attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}