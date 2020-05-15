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
        self._cardTable = 'rfCards'
        self._cardValues = self._initializeCardValues()

    # hit from 'initialize' endpoint

    def initiateConnection(self):
        # check that game id exists

        if self._gameIdExists():
            self.sendCurrentCards()
            connObjs = self._getConnObjs()
            newConnObj = {'S': self._connectionId}
            if newConnObj not in connObjs:
                connObjs.append(newConnObj)
                self._updateConnections(connObjs)
            else:
                logger.log(logging.ERROR,
                           f'Repeated connection id?? {self._connectionId}')

    def sendConnectionId(self):
        self.sendMsg(dict(
            action='initialize-connection-id',
            message=dict(
                gameId=self._gameId,
                connectionId=self._connectionId
            )
        ), toSelf=True)

    def sendCurrentCards(self):
        cards = []
        for cardValue in self._cardValues:

            cardMsg = self.getCardMsgFromDb(cardValue)
            cards.append(cardMsg)
            logger.log(logging.INFO, cardMsg)

        self.sendMsg(dict(
            action='initialize-cards',
            message=dict(
                gameId=self._gameId,
                cards=cards
            )
        ), toSelf=True)

    def _gameIdExists(self):
        getResp = self._dynamoClient.get_item(
            TableName=self._connectionTable,
            Key={
                "gameId": {
                    "S": self._gameId
                }
            })
        gameExists = 'Item' in getResp
        self.messageSelf({
            'action': "initialize",
            'message': {
                'gameId': self._gameId,
                'gameExists': gameExists
            }
        })
        return gameExists

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
        self.recallAndShuffleDb()

    # send msg to everyone and/or self
    # automatically update live connections table
    # msgObj must be a dict
    def sendMsg(self, msgObj, toSelf=False, toOthers=False):
        if toSelf and not toOthers:
            self._msgToConnection(self._connectionId, json.dumps(msgObj))
        else:
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
            self._gwClient.post_to_connection(ConnectionId=connectionId,
                                              Data=msg.encode('utf-8'))
            return {'successful': True}
        except self._gwClient.exceptions.GoneException:  # GoneException, delete this connection id
            logger.log(
                logging.ERROR, f'dead id or error in msg {connectionId} {str(msg)}')
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
            if 'connectionIds' in getItem:
                connIds = getItem['connectionIds']['L']
                return connIds
        return []

    def startCardMove(self, eventMsg):
        message = eventMsg['message']
        cardValue = message['cardValue']
        self._dynamoClient.update_item(
            TableName=self._cardTable,
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
        return None

    def endCardMove(self, eventMsg):

        message = eventMsg['message']

        self.updateDbCardPosition(message)
        return None

    def getCardMsgFromDb(self, cardValue):
        getResp = self._dynamoClient.get_item(
            TableName=self._cardTable,
            Key={
                "gameId": {
                    "S": self._gameId
                },
                "cardValue": {
                    "S": cardValue
                }
            }
        )
        dbCard = getResp['Item']

        message = dict(
            x=int(dbCard['x']['N']),
            y=int(dbCard['y']['N']),
            z=int(dbCard['z']['N']),
            cardValue=cardValue,
            # groupId=db['cardValue']
            faceUp=bool(dbCard['faceUp']['BOOL']),
            ownerId=dbCard['ownerId']['S']
        )
        return message

    def updateDbCardPosition(self, updateObj):
        cardValue = updateObj['cardValue']

        dbObj = dict(date=dict(
            Value=dict(S=datetime.now().isoformat()),
            Action='PUT'
        ))

        if 'x' in updateObj:
            dbObj['x'] = dict(
                Value=dict(N=str(updateObj['x'])),
                Action='PUT'
            )

        if 'y' in updateObj:
            dbObj['y'] = dict(
                Value=dict(N=str(updateObj['y'])),
                Action='PUT'
            )
        if 'z' in updateObj:
            dbObj['z'] = dict(
                Value=dict(N=str(updateObj['z'])),
                Action='PUT'
            )

        if 'groupId' in updateObj:
            dbObj['groupId'] = dict(
                Value=dict(N=str(updateObj['groupId'])),
                Action='PUT'
            )

        if 'ownerId' in updateObj:
            dbObj['ownerId'] = dict(
                Value=dict(S=str(updateObj['ownerId'])),
                Action='PUT'
            )

        if 'faceUp' in updateObj:
            dbObj['faceUp'] = dict(
                Value=dict(BOOL=bool(updateObj['faceUp'])),
                Action='PUT'
            )

        # TODO: how to bulk send?
        self._dynamoClient.update_item(
            TableName=self._cardTable,
            Key=dict(
                gameId=dict(S=self._gameId),
                cardValue=dict(S=cardValue),
            ),
            AttributeUpdates=dbObj)

    def recallAndShuffleDb(self):

        cardValues = self._cardValues.copy()

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
                ownerId='none'
            )
            # TODO- this blocks, causing slowness. How do we send all at once?
            self.updateDbCardPosition(objToSend)
            i += 1

    def _initializeCardValues(self):
        cardValues = []
        for suit in ['H', 'D', 'S', 'C']:
            for value in ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']:
                cardValue = f'{value}{suit}'
                cardValues.append(cardValue)

        return cardValues
