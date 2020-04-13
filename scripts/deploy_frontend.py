import os
import sys
import boto3
from datetime import datetime 

API_NAME = 'rf-website-artifacts-bucket'
OUT_DIR = 'frontend/dist/'
CLOUDFRONT_URL = 'd155q41ienh9f7'
CLOUDFRONT_ID = 'EG8FC9V8HICY5'
URL = f'https://{CLOUDFRONT_URL}.cloudfront.net/'
BUCKET = 'rf-website-artifacts-bucket'


def main():
    print('Deploying to AWS...')
    profile_name = 'default'
    session = boto3.Session(profile_name=profile_name)
    s3_client = session.client('s3', region_name='us-east-1')

    print(f'Uploading: index.html')
    s3_client.upload_file(OUT_DIR + 'index.html', BUCKET, 'index.html', ExtraArgs={
                          'ACL': 'public-read', 'ContentType': 'text/html'})

    # Upload private .js, .css, and .ico files to private bucket:
    for artifact_file in os.listdir(OUT_DIR):
        artifact_path = OUT_DIR + artifact_file
        if '.js' in artifact_file:
            print(f'Uploading: {artifact_file}')
            s3_client.upload_file(artifact_path, BUCKET, artifact_file, ExtraArgs={
                                  'ContentType': 'application/javascript'})
        elif '.ico' in artifact_file:
            print(f'Uploading: {artifact_file}')
            s3_client.upload_file(artifact_path, BUCKET, artifact_file, ExtraArgs={
                                  'ContentType': 'image/x-icon'})
        elif '.css' in artifact_file:
            print(f'Uploading: {artifact_file}')
            s3_client.upload_file(artifact_path, BUCKET, artifact_file, ExtraArgs={
                                  'ContentType': 'text/css'})

    cf_client = boto3.client('cloudfront')
    cf_client.create_invalidation(
        DistributionId=CLOUDFRONT_ID,
        InvalidationBatch={
            'Paths': {
                'Quantity': 1,
                'Items': ['/*']
            },
            'CallerReference': f'invalidation_{datetime.now().isoformat()}'
        }
    )

    print('Done.')


if __name__ == "__main__":
    main()
