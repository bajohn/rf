
import os
import sys
import boto3
OUT_DIR = './dist/'
ENVIRON_DIR = './src/environments/'
TEMP_FILE_NAME = OUT_DIR + 'index_to_upload.html'


def initialize():

    if len(sys.argv) < 2:
        raise ValueError('Missing command line arg "dev" or "prod"')
    deploy_mode = sys.argv[1]
    if deploy_mode != 'dev' and deploy_mode != 'prod':
        raise ValueError('Command line arg must be "dev" or "prod"')

    profile_name = 'ddx-' + deploy_mode
    session = boto3.Session(profile_name=profile_name)
    api_client = session.client('apigateway', region_name='us-east-1')
    aws_resp = api_client.get_rest_apis()
    api_list = aws_resp['items']

    print(f'Mode: {deploy_mode}')
    ret = dict(
        public_bucket = deploy_mode + '-ddx-web-content',
        private_bucket = deploy_mode + '-ddx-web-content-private',
        api_list = api_list,
        session = session
    )

    return ret

def find_api(api_list, api_name):
    def _search_func(el):

        if api_name == el['name']:
            return True
        return False

    filtered_list = filter(_search_func, api_list)
    api_id = ''
    for f in filtered_list:
        if api_id == '':
            api_id = f['id']
        else:
            raise ValueError(f'Multiple APIs with name "{api_name}"')

    if api_id == '':
        raise ValueError(f'No API found with ID "{api_name}"')

    return api_id