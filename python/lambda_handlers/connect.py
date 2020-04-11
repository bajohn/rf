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
