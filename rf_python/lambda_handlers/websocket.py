import requests
import logging
import json
from datetime import datetime

import boto3
import time

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'hellowwwww')
    logger.log(logging.INFO, json.dumps(event))

    connection_id = event['requestContext']['connectionId']
    logger.log(logging.INFO, f'CONN ID {connection_id}')
    client = boto3.client('dynamodb')

    game_id = 'g123'

    get_resp = client.get_item(
        TableName='rf_game',
        Key={
            "game_id": {
                "S": game_id
            }
        })

    if 'Item' in get_resp:
        get_item = get_resp['Item']
        if 'connection_ids' in get_item:
            conn_ids = get_item['connection_ids']['L']
            conn_ids.append({'S': connection_id})
            put_resp = put_conn_ids(client, game_id, conn_ids)
        else:
            raise Exception('Missing connection ids?!')
    else:
        put_resp = put_conn_ids(client, game_id, [{"S": connection_id}])

    # time.sleep(2)

    # post_to_connection(connection_id, event)

    return {"statusCode": 200}


def post_to_connection(connection_id, event):
    domain = event['requestContext']['domainName']
    stage = event['requestContext']['stage']
    endpoint = f'https://{domain}/{stage}'
    logger.log(logging.INFO, 'ENDPOINTTT')
    logger.log(logging.INFO, endpoint)

    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url=endpoint)
    data = 'Hello from backend'
    resp = gatewayapi.post_to_connection(ConnectionId=connection_id,
                                         Data=data.encode('utf-8'))
    return resp


def put_conn_ids(client, game_id, conn_ids):
    put_resp = client.put_item(
        TableName='rf_game',
        Item={
            "game_id": {
                "S": game_id
            },
            "connection_ids": {
                "L": conn_ids
            },
            "date": {
                "S": datetime.now().isoformat()
            }

        })
    return put_resp


# interesting paart of log json dumps(event):
# {
#     "requestContext": {
#         "routeKey": "$connect",
#         "messageId": null,
#         "eventType": "CONNECT",
#         "extendedRequestId": "KVmb8FWjoAMFQWg=",
#         "requestTime": "02/Apr/2020:02:42:33 +0000",
#         "messageDirection": "IN",
#         "stage": "dev",
#         "connectedAt": 1585795353168,
#         "requestTimeEpoch": 1585795353170,
#         "identity": {
#             "cognitoIdentityPoolId": null,
#             "cognitoIdentityId": null,
#             "principalOrgId": null,
#             "cognitoAuthenticationType": null,
#             "userArn": null,
#             "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
#             "accountId": null,
#             "caller": null,
#             "sourceIp": "108.48.186.32",
#             "accessKey": null,
#             "cognitoAuthenticationProvider": null,
#             "user": null
#         },
#         "requestId": "KVmb8FWjoAMFQWg=",
#         "domainName": "acyiae8dc2.execute-api.us-east-1.amazonaws.com",
#         "connectionId": "KVmb8fjMIAMCFgQ=",
#         "apiId": "acyiae8dc2"
#     },
#     "isBase64Encoded": false
# }


# {
#     "requestContext": {
#         "routeKey": "subscribe_to_message",
#         "messageId": "KVmcDfjfIAMCFgQ=",
#         "eventType": "MESSAGE",
#         "extendedRequestId": "KVmcDGcCIAMFeiw=",
#         "requestTime": "02/Apr/2020:02:42:33 +0000",
#         "messageDirection": "IN",
#         "stage": "dev",
#         "connectedAt": 1585795353168,
#         "requestTimeEpoch": 1585795353851,
#         "identity": {
#             "cognitoIdentityPoolId": null,
#             "cognitoIdentityId": null,
#             "principalOrgId": null,
#             "cognitoAuthenticationType": null,
#             "userArn": null,
#             "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
#             "accountId": null,
#             "caller": null,
#             "sourceIp": "108.48.186.32",
#             "accessKey": null,
#             "cognitoAuthenticationProvider": null,
#             "user": null
#         },
#         "requestId": "KVmcDGcCIAMFeiw=",
#         "domainName": "acyiae8dc2.execute-api.us-east-1.amazonaws.com",
#         "connectionId": "KVmb8fjMIAMCFgQ=",
#         "apiId": "acyiae8dc2"
#     },
#     "body": "{\"action\":\"subscribe_to_message\",\"message\":\"hello world!\"}",
#     "isBase64Encoded": false
# }
