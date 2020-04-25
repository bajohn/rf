import os
import sys
import boto3
from datetime import datetime

# card graphics svgs
DEPLOY_SVGS = False

API_NAME = 'rf-website-artifacts-bucket'
OUT_DIR = 'frontend/dist'
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
    s3_client.upload_file(OUT_DIR + '/index.html', BUCKET, 'index.html', ExtraArgs={
                          'ACL': 'public-read', 'ContentType': 'text/html'})

    # Upload private .js, .css, and .ico files to private bucket:
    _recurs_upload(s3_client, OUT_DIR)

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


def _recurs_upload(s3_client, path):
    for artifact_file in os.listdir(path):
        artifact_path = f'{path}/{artifact_file}'
        if os.path.isdir(artifact_path):
            _recurs_upload(s3_client, artifact_path)
        else:
            _upload_valid_file(s3_client, artifact_file, artifact_path)


def _upload_valid_file(s3_client, artifact_file, artifact_path):
    upload_path = artifact_path[len(OUT_DIR)+1:]
    mime_dict = {
        '.js': 'application/javascript',
        '.ico': 'image/x-icon',
        '.css': 'text/css'
    }
    if DEPLOY_SVGS:
        mime_dict['.svg'] = 'image/svg+xml'

    for key in mime_dict:
        if key in artifact_file:
            print(f'Uploading: {artifact_file}')
            s3_client.upload_file(artifact_path, BUCKET, upload_path, ExtraArgs={
                'ContentType': mime_dict[key]})


if __name__ == "__main__":
    main()
