# Note- this module is not fully implemented due to 
# lack of terraform support as of yet.

#resource "aws_apigatewayv2_integration" "gw-integration" {
#  api_id           = var.api.id
#  integration_type = "AWS_PROXY"
#
#  connection_type           = "INTERNET"
#  content_handling_strategy = "CONVERT_TO_TEXT"
#  description               = "Lambda example"
#  integration_method        = "POST"
#  integration_uri           = var.lambda.invoke_arn
#  passthrough_behavior      = "WHEN_NO_MATCH"
#}


