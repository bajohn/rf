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
