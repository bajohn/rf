#!/bin/bash
S3_BUCKET_NAME='rf-lambda-bucket'

for file_inner in ./out/** #separate zip for each lambda
do
    aws s3 cp $file_inner s3://$S3_BUCKET_NAME/$file_inner
done