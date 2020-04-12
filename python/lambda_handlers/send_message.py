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
    client = boto3.client('dynamodb')
    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url=endpoint)

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
            dead_conns = []
            for conn_id_obj in conn_ids:
                conn_id = conn_id_obj['S']
                dead_conns.extend(post_to_connection(event, conn_id, '{"msg": "Boom!!"}'))
            alive_conns = [c for c in conn_ids where c not in dead_conns]
            put_conn_ids(gatewayapi, game_id, alive_conns)
            
        else:
            raise Exception('Missing connection ids?!')

    return {"statusCode": 200}


def post_to_connection(event, connection_id, msg):
    domain = event['requestContext']['domainName']
    stage = event['requestContext']['stage']
    endpoint = f'https://{domain}/{stage}'


    try:
        gatewayapi.post_to_connection(ConnectionId=connection_id,
                                         Data=msg.encode('utf-8'))
        return []
    except:  #GoneException, delete this connection id
        return [connection_id]


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
