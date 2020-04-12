import logging
import boto3
import json
from datetime import datetime
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# TODO: error catch / log on all the things


class Helpers():

    def __init__(self, event):

        # need better handling around this
        # note: body is not included in $connect 
        body_obj = json.loads(event['body'])
        self._game_id = body_obj['message']['game_id']
        self._dynamo_client = boto3.client('dynamodb')

        domain = event['requestContext']['domainName']
        stage = event['requestContext']['stage']
        endpoint = f'https://{domain}/{stage}'
        self._gw_client = boto3.client(
            "apigatewaymanagementapi", endpoint_url=endpoint)
        self._connection_id = event['requestContext']['connectionId']
        self._event = event
        self._connection_table = 'rf_connections'

    # send msg to everyone except own connections
    # automatically update live connections table
    # msg_obj must be a dict
    def broadcast_message(self, msg_obj):
        cur_conn_objs = self._get_connection_objs()

        alive_conn_objs = []
        for conn_id_obj in cur_conn_objs:
            conn_id = conn_id_obj['S']
            if conn_id != self._connection_id:
                res = self._msg_to_connection(
                    conn_id, json.dumps(msg_obj))
                if res['successful']:
                    alive_conn_objs.append(conn_id_obj)

        alive_conn_objs.append({"S": self._connection_id})
        self._update_connections(alive_conn_objs)

    # This doesn't work for $connect endpoint,
    # might need to manually send a connect message,
    # or just be smart about checking for connection id later
    def initiate_connection(self):
        conn_objs = self._get_connection_objs()
        new_conn_obj = {'S': self._connection_id}
        if new_conn_obj not in conn_objs:
            conn_objs.append(new_conn_obj)
            self._update_connections(conn_objs)
        else:
            logger.log(logging.ERROR,
                       f'Repeated connection id?? {self._connection_id}')

    # get python dict received from websocket connection

    def get_event_msg(self, key):
        body_obj = json.loads(self._event['body'])
        return body_obj['message'][key]

    def clear_connections(self):
        self._update_connections([])

    # send msg to specified connection
    # return {successful} with whether message went out or not
    def _msg_to_connection(self, connection_id, msg):

        try:
            gatewayapi.post_to_connection(ConnectionId=connection_id,
                                          Data=msg.encode('utf-8'))
            return {'successful': True}
        except:  # GoneException, delete this connection id
            logger.log(logging.INFO, f'dead id {connection_id}')
            return {'successful': False}

    # update connection table in dynamo
    def _update_connections(self, conn_id_objs):

        self._dynamo_client.put_item(
            TableName=self._connection_table,
            Item={
                "game_id": {
                    "S": self._game_id
                },
                "connection_ids": {
                    "L": conn_id_objs
                },
                "date": {
                    "S": datetime.now().isoformat()
                }
            })

    # get current connections from dynamo
    def _get_connection_objs(self):
        get_resp = self._dynamo_client.get_item(
            TableName=self._connection_table,
            Key={
                "game_id": {
                    "S": self._game_id
                }
            })

        if 'Item' in get_resp:
            get_item = get_resp['Item']
            if 'connection_ids' in get_item:
                conn_ids = get_item['connection_ids']['L']
                return conn_ids
        return []
