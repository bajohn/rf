provider "aws" {
  profile = "default"
  region  = "us-east-1"
}

resource "aws_s3_bucket" "code_bucket" {
  region =  "us-east-1"
  bucket = "rf-lambda-bucket"
  acl    = "private"
  website {
    error_document = "index.html"
    index_document = "index.html"
  }
}

resource "aws_lambda_layer_version" "lib_layer" {
  filename   = "../out/rf_lib.zip"
  layer_name = "rf-libs"

  compatible_runtimes = ["python3.7"]
}


resource "aws_lambda_function" "websocket_lambda" {
  source_code_hash = filebase64sha256("../out/websocket.zip")
  filename      = "../out/websocket.zip"
  function_name = "websocket-handler"
  role          = aws_iam_role.iam_for_rf_lambda.arn
  handler       = "websocket.handler"

  layers  = ["${aws_lambda_layer_version.lib_layer.arn}"]
  runtime = "python3.7"

} 

resource "aws_iam_role" "iam_for_rf_lambda" {
  name = "iam_for_rf_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}
