import logging
import boto3
import json
from datetime import datetime
logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'connecting...')
    logger.log(logging.INFO, json.dumps(event))

    body_obj = json.loads(event['body'])
    game_id = body_obj['message']['game_id']

    logger.log(logging.INFO, f'game id  {game_id}')
    client = boto3.client('dynamodb')

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
