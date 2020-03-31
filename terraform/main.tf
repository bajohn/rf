provider "aws" {
  profile = "default"
  region  = "us-east-1"
}

resource "aws_s3_bucket" "code_bucket" {
  region =  "us-east-1"
  bucket = "rf-lambda-bucket"
  acl    = "private"
}

resource "aws_s3_bucket" "website_bucket" {
  region =  "us-east-1"
  bucket = "rf-website-artifacts-bucket"
  acl    = "private"
  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject"
            ],
            "Resource": [
                "arn:aws:s3:::rf-website-artifacts-bucket/*"
            ]
        }
    ]
}

  EOF
  website {
    error_document = "index.html"
    index_document = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "website_bucket_public_access" {
  bucket = aws_s3_bucket.website_bucket.id

  block_public_acls   = false
  ignore_public_acls = false
  block_public_policy = false
  restrict_public_buckets = false
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

resource "aws_cloudfront_distribution" "website_distribution" {
  origin {
    domain_name = aws_s3_bucket.website_bucket.bucket_domain_name
    origin_id   =  "${aws_s3_bucket.website_bucket.id}-s3-origin" 
  }
  # aliases = [ var.domain-name]
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id =  "${aws_s3_bucket.website_bucket.id}-s3-origin" 

    forwarded_values {
      query_string = false

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "allow-all"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 31536000
  }
  enabled         = true
  is_ipv6_enabled = true


  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}


# Add this to lambda permissions:
# {
#   "Version": "2012-10-17",
#   "Id": "default",
#   "Statement": [
#     {
#       "Sid": "b12ede1c-43d5-447f-a1eb-ccbadca95007",
#       "Effect": "Allow",
#       "Principal": {
#         "Service": "apigateway.amazonaws.com"
#       },
#       "Action": "lambda:InvokeFunction",
#       "Resource": "arn:aws:lambda:us-east-1:748004005034:function:websocket-handler",
#       "Condition": {
#         "ArnLike": {
#           "AWS:SourceArn": "arn:aws:execute-api:us-east-1:748004005034:acyiae8dc2/*/subscribe_to_message"
#         }
#       }
#     }
#   ]
# }