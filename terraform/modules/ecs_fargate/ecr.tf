resource "aws_ecr_repository" "ecr_repo_slasher-web-new" {
  name                 = "slasher-web-new-${terraform.workspace}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "ecr_repo_slasher-cron" {
  name                 = "slasher-cron-${terraform.workspace}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}