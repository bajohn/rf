import logging
import boto3
import json
from datetime import datetime
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'connecting...')
    logger.log(logging.INFO, json.dumps(event))

    connection_id = event['requestContext']['connectionId']
    logger.log(logging.INFO, f'CONN ID {connection_id}')
    client = boto3.client('dynamodb')

    game_id = 'cccc'

    put_conn_ids(client, game_id, [])

    return {"statusCode": 200}


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
