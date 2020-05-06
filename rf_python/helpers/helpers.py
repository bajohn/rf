import logging
import boto3
import json
import traceback
import random


from datetime import datetime
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# TODO: error catch / log on all the things


class Helpers():

    def __init__(self, event):

        # need better handling around this
        # note: body is not included in $connect
        bodyObj = json.loads(event['body'])
        self._gameId = bodyObj['message']['gameId']
        self._dynamoClient = boto3.client('dynamodb')

        domain = event['requestContext']['domainName']
        stage = event['requestContext']['stage']
        endpoint = f'https://{domain}/{stage}'
        self._gwClient = boto3.client(
            "apigatewaymanagementapi", endpoint_url=endpoint)
        self._connectionId = event['requestContext']['connectionId']
        self._event = event
        self._connectionTable = 'rfConnections'

    # This doesn't work for $connect endpoint,
    # is sent via an "initialize" endpoint instead.

    def initiateConnection(self):
        # check that game id exists
        if self._gameIdExists():
            connObjs = self._getConnObjs()
            newConnObj = {'S': self._connectionId}

            if newConnObj not in connObjs:
                connObjs.append(newConnObj)
                self._updateConnections(connObjs)
            else:
                logger.log(logging.ERROR,
                           f'Repeated connection id?? {self._connectionId}')

    def sendCurrentCards(self):
        raise NotImplementedError

    def _gameIdExists(self):
        getResp = self._dynamoClient.get_item(
            TableName=self._connectionTable,
            Key={
                "gameId": {
                    "S": self._gameId
                }
            })

        self.messageSelf({
            'action': "initialize",
            'message': {
                'gameId': self._gameId,
                'gameExists': 'Item' in getResp
            }
        })

    def createRoom(self):
        newConnObj = {'S': self._connectionId}

        self._dynamoClient.put_item(
            TableName=self._connectionTable,
            Item={
                "gameId": {
                    "S": self._gameId
                },
                "connectionIds": {
                    "L": [newConnObj]
                },
                "date": {
                    "S": datetime.now().isoformat()
                }
            })
        self._initializeCards()

    # send msg to everyone, including optionally, self
    # automatically update live connections table
    # msgObj must be a dict

    def messageBroadcast(self, msgObj, toSelf=False):
        connObjs = self._getConnObjs()

        aliveConnObjs = []
        for connObj in connObjs:
            connId = connObj['S']
            if (connId != self._connectionId) or toSelf:
                res = self._msgToConnection(
                    connId, json.dumps(msgObj))
                if res['successful']:
                    aliveConnObjs.append(connObj)

        aliveConnObjs.append({"S": self._connectionId})
        self._updateConnections(aliveConnObjs)

    # get python dict received from websocket connection

    def getEventMsg(self):
        bodyObj = json.loads(self._event['body'])
        return bodyObj

    def clearConnections(self):
        self._updateConnections([])

    # msg must be Python dict
    def messageSelf(self, msgObj):
        self._msgToConnection(self._connectionId, json.dumps(msgObj))

    # send msg to specified connection
    # msg must be json string
    # return {successful} with whether message went out or not
    def _msgToConnection(self, connectionId, msg):

        try:
            self._gw_client.post_to_connection(ConnectionId=connectionId,
                                               Data=msg.encode('utf-8'))
            return {'successful': True}
        except:  # GoneException, delete this connection id
            logger.log(
                logging.INFO, f'dead id or error in msg {connectionId} {str(msg)}')
            return {'successful': False}

    # update connection table in dynamo
    def _updateConnections(self, connIdObjs):

        self._dynamoClient.put_item(
            TableName=self._connectionTable,
            Item={
                "gameId": {
                    "S": self._gameId
                },
                "connectionIds": {
                    "L": connIdObjs
                },
                "date": {
                    "S": datetime.now().isoformat()
                }
            })

    # get current connections from dynamo
    def _getConnObjs(self):
        getResp = self._dynamoClient.get_item(
            TableName=self._connectionTable,
            Key={
                "gameId": {
                    "S": self._gameId
                }
            })

        if 'Item' in getResp:
            getItem = getResp['Item']
            if 'c' in getItem:
                connIds = getItem['connectionIds']['L']
                return connIds
        return []

    def startCardMove(self, eventMsg):
        message = eventMsg['message']
        cardValue = message['cardValue']
        self._dynamoClient.put_item(
            TableName='rfCards',
            Item={
                "gameId": {
                    "S": self._gameId
                },
                "cardValue": {
                    "S": cardValue
                },
                "x": {
                    "N": str(message['x'])
                },
                "y": {
                    "N": str(message['y'])
                },
                "z": {
                    "N": str(message['z'])
                },
                "date": {
                    "S": datetime.now().isoformat()
                }
            })
        logger.log(logging.INFO, 'put finished')
        return None

    def endCardMove(self, eventMsg):

        message = eventMsg['message']

        self.updateDbCardPosition(message)
        return None

    def updateDbCardPosition(self, updateObj):

        dbObj = {
            "gameId": {
                "S": self._gameId
            },
            "cardValue": {
                "S": updateObj['cardValue']
            },
            "date": {
                "S": datetime.now().isoformat()
            }
        }

        if 'x' in updateObj:
            dbObj['x'] = {
                "N":  str(updateObj['x'])
            }
        if 'y' in updateObj:
            dbObj['y'] = {
                "N":  str(updateObj['y'])
            }

        if 'z' in updateObj:
            dbObj['z'] = {
                "N":  str(updateObj['z'])
            }

        if 'groupId' in updateObj:
            dbObj['z'] = {
                "N":  str(updateObj['groupId'])
            }

        if 'faceUp' in updateObj:
            dbObj['faceUp'] = {
                "BOOL":  bool(updateObj['groupId'])
            }

        if 'ownerId' in updateObj:
            dbObj['faceUp'] = {
                "S":  bool(updateObj['ownerId'])
            }

        self._dynamoClient.put_item(
            TableName='rfCards',
            Item=dbObj)

    def _initializeCards(self):

        cardValues = []
        for suit in ['H', 'D', 'S', 'C']:
            for value in ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']:
                cardValue = f'{value}{suit}'
                cardValues.append(cardValue)

        random.shuffle(cardValues)
        i = 0
        while len(cardValues) > 0:
            cardValue = cardValues.pop()
            objToSend = dict(
                cardValue=cardValue,
                x=10,
                y=10,
                z=i,
                groupId=0,
                faceUp=False,
                ownerId=''
            )
            self.updateDbCardPosition(objToSend)
            self.messageBroadcast(objToSend, True)
            i += 1
