
resource "aws_lambda_function" "ws_lambda" {
  source_code_hash = filebase64sha256("../out/${var.name}.zip")
  filename         = "../out/${var.name}.zip"
  function_name    = "ws-${var.name}-lambda"
  role             = var.iam_arn
  handler          = "rf_python.lambda_handlers.${var.name}.handler"

  layers  = ["${var.layer_arn}"]
  runtime = "python3.7"
  timeout = 6
}