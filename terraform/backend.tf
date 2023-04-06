terraform {
  backend "s3" {
    bucket         = "slasher-tfstate-restricted"
    key            = "slasher-web-new/appinfra.tfstate"
    region         = "us-east-1"
    dynamodb_table = "s3-tf-state-lock"
  }
}