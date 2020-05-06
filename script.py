import boto3
import json 
from datetime import datetime

# for local, non-lambda testing!!!

# def main():
#     client = boto3.client('dynamodb')

#     gameId = 'y666'

#     get_resp = client.get_item(
#         TableName='rf_game',
#         Key={
#             "gameId": {
#                 "S": gameId
#             }
#         })

#     if 'Item' in get_resp:
#         get_item = get_resp['Item']
#         if 'connectionIds' in get_item:
#             conn_ids = get_item['connectionIds']['L']
#             conn_ids.append({'S': '1234'})
#             put_resp = put_conn_ids(client, gameId, conn_ids)
#         else:
#             raise Exception('Missing connection ids?!')
#     else:
#         put_resp = put_conn_ids(client, gameId, [{"S": 'hhhh99999'}])

#     print(put_resp)


def main():
    connectionId = 'K1EcHeDToAMCIyQ=' # hard copied from dynamo db
    api = 'https://9owex9co2e.execute-api.us-east-1.amazonaws.com/dev_stage'
    post_to_connection(connectionId, api)

def put_conn_ids(client, gameId, connIds):
    put_resp = client.put_item(
        TableName='rf_game',
        Item={
            "gameId": {
                "S": gameId
            },
            "connectionIds": {
                "L": connIds
            },
            "date": {
                "S": datetime.now().isoformat()
            }

        })
    return put_resp

def post_to_connection(connectionId, api):

    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url=api)
    data = {'message': 'Hello from backend'}
    print(datetime.now().isoformat()) # latency ~50-100 ms to cloudfront
    resp = gatewayapi.post_to_connection(ConnectionId=connectionId,
                                         Data=json.dumps(data))
    return resp


if __name__ == "__main__":
    main()
