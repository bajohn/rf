provider "aws" {
  profile = "default"
  region  = "us-east-1"
  version = "2.57.0"

}

resource "aws_s3_bucket" "code_bucket" {
  region = "us-east-1"
  bucket = "rf-lambda-bucket"
  acl    = "private"
}

resource "aws_s3_bucket" "website_bucket" {
  region = "us-east-1"
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

  block_public_acls       = false
  ignore_public_acls      = false
  block_public_policy     = false
  restrict_public_buckets = false
}

resource "aws_lambda_layer_version" "lib_layer" {
  filename   = "../out/rf_lib.zip"
  layer_name = "rf-libs"

  compatible_runtimes = ["python3.7"]
}



# endpoint: $connect
module "connect_lambda" {
  source    = "./modules/ws-lambda"
  name      = "connect"
  iam_arn   = aws_iam_role.iam_for_rf_role.arn
  layer_arn = aws_lambda_layer_version.lib_layer.arn
}

# endpoint: initialize
module "initialize_lambda" {
  source    = "./modules/ws-lambda"
  name      = "initialize"
  iam_arn   = aws_iam_role.iam_for_rf_role.arn
  layer_arn = aws_lambda_layer_version.lib_layer.arn
}

# endpoint: card-shuffle
module "recall_and_shuffle_lambda" {
  source    = "./modules/ws-lambda"
  name      = "recall_and_shuffle"
  iam_arn   = aws_iam_role.iam_for_rf_role.arn
  layer_arn = aws_lambda_layer_version.lib_layer.arn
}

# endpoint: create-room 
module "createroom_lambda" {
  source    = "./modules/ws-lambda"
  name      = "create_room"
  iam_arn   = aws_iam_role.iam_for_rf_role.arn
  layer_arn = aws_lambda_layer_version.lib_layer.arn
}

# endpoint: clear-connections
module "clear_connections_lambda" {
  source    = "./modules/ws-lambda"
  name      = "clear_connections"
  iam_arn   = aws_iam_role.iam_for_rf_role.arn
  layer_arn = aws_lambda_layer_version.lib_layer.arn
}



# endpoint: send-message
module "send_message_lambda" {
  source    = "./modules/ws-lambda"
  name      = "send_message"
  iam_arn   = aws_iam_role.iam_for_rf_role.arn
  layer_arn = aws_lambda_layer_version.lib_layer.arn
}



# endpoint: card-move-start
module "card_move_start_lambda" {
  source    = "./modules/ws-lambda"
  name      = "card_move_start"
  iam_arn   = aws_iam_role.iam_for_rf_role.arn
  layer_arn = aws_lambda_layer_version.lib_layer.arn
}



# endpoint: card-move-end
module "card_move_end_lambda" {
  source    = "./modules/ws-lambda"
  name      = "card_move_end"
  iam_arn   = aws_iam_role.iam_for_rf_role.arn
  layer_arn = aws_lambda_layer_version.lib_layer.arn
}




resource "aws_iam_role" "iam_for_rf_role" {
  name = "iam_for_rf"

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


resource "aws_iam_policy" "iam_for_rf_policy" {
  name        = "rf-lambda-policy"
  description = "A policy for the rf websocket lambda"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "execute-api:Invoke",
                "execute-api:ManageConnections"
            ],
            "Resource": "arn:aws:execute-api:*:*:*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": "dynamodb:*",
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_policy_attachment" "iam_for_rf_attach" {
  name       = "IAM for RF policy attachment"
  roles      = [aws_iam_role.iam_for_rf_role.name]
  policy_arn = aws_iam_policy.iam_for_rf_policy.arn
}



resource "aws_cloudfront_distribution" "website_distribution" {
  origin {
    domain_name = aws_s3_bucket.website_bucket.bucket_domain_name
    origin_id   = "${aws_s3_bucket.website_bucket.id}-s3-origin"
  }
  # aliases = [ var.domain-name]
  viewer_certificate {
    cloudfront_default_certificate = true
  }
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "${aws_s3_bucket.website_bucket.id}-s3-origin"

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

# aws apigatewayv2 get-integrations --api-id acyiae8dc2
# terraform import aws_api_gateway_rest_api.rf-api 
# aws apigatewayv2 get-integration --api-id acyiae8dc2 --integration-id 5axmhhq

# NOTE: Terraform has not yet added full support
# for api gateway v2. Integrations were only added 2020-04-09 (v2.57.0).
# Therefore, most configuration was done on AWS console.
# Hopefully support will be added soon and we can import
resource "aws_apigatewayv2_api" "rf-api" {
  name                       = "RF WS API"
  protocol_type              = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
  description                = "RF Websocket API. Pull 'action' out of request JSON body."

}




# dynamo: Connections Table: hit once for all connections to a game.
# partition key: room id: string
# attribute: connectionIds: array of strings 
# attribute: time: start_time


# partition key: game id (0,1,2,3)
# sort key: connection id (0,1,2,3)
# attribute: [
#  {
#    action: string 
#    time: string
#  }
#]r

# dynamo: websocket table
# partition key: connection id
# sort key


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
