import boto3
import json 
from datetime import datetime

# for local, non-lambda testing!!!

# def main():
#     client = boto3.client('dynamodb')

#     game_id = 'y666'

#     get_resp = client.get_item(
#         TableName='rf_game',
#         Key={
#             "game_id": {
#                 "S": game_id
#             }
#         })

#     if 'Item' in get_resp:
#         get_item = get_resp['Item']
#         if 'connection_ids' in get_item:
#             conn_ids = get_item['connection_ids']['L']
#             conn_ids.append({'S': '1234'})
#             put_resp = put_conn_ids(client, game_id, conn_ids)
#         else:
#             raise Exception('Missing connection ids?!')
#     else:
#         put_resp = put_conn_ids(client, game_id, [{"S": 'hhhh99999'}])

#     print(put_resp)


def main():
    connection_id = 'K1EcHeDToAMCIyQ=' # hard copied from dynamo db
    api = 'https://acyiae8dc2.execute-api.us-east-1.amazonaws.com/dev'
    post_to_connection(connection_id, api)

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

def post_to_connection(connection_id, api):

    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url=api)
    data = {'message': 'Hello from backend'}
    print(datetime.now().isoformat()) # latency ~50-100 ms to cloudfront
    resp = gatewayapi.post_to_connection(ConnectionId=connection_id,
                                         Data=json.dumps(data))
    return resp


if __name__ == "__main__":
    main()
