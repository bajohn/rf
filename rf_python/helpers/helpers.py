import logging
import boto3
import json
import traceback
import random
from uuid import uuid4

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
        self._groupTable = 'rfGroups'
        self._cardTable = 'rfCards'
        self._playerTable = 'rfPlayers'
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

        cards = self.getCardMsgFromDbBatch(self._cardValues)
        groups = self._getGroups()

        self.sendMsg(dict(
            action='initialize-cards',
            message=dict(
                gameId=self._gameId,
                cards=cards,
                groups=groups)
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

    def _getGroups(self):
        dbResp = self._dynamoClient.scan(
            ExpressionAttributeValues={
                ':g': {
                    'S': self._gameId,
                },
            },
            FilterExpression='gameId = :g',
            TableName=self._groupTable,
        )

        if 'Items' in dbResp:
            return [
                dict(
                    groupId=item['groupId']['S'],
                    x=item['x']['N'],
                    y=item['y']['N'],
                    date=item['date']['S']
                ) for item in dbResp['Items']
            ]
        else:
            return []

    def createRoom(self):
        initX = 100
        initY = 100
        newConnObj = {'S': self._connectionId}
        curDate = self._getCurUtcStr()
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
                    "S": curDate
                }
            })

        deckGroup = str(uuid4())

        self._dynamoClient.put_item(
            TableName=self._groupTable,
            Item={
                "gameId": {
                    "S": self._gameId
                },
                "groupId": {
                    "S": deckGroup
                },
                "date": {
                    "S": curDate
                },
                "x": {
                    "N": str(initX)
                },
                "y": {
                    "N": str(initY)
                },
            })

        self.recallAndShuffleDb(deckGroup, initX, initY, curDate)

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
                    "S": self._getCurUtcStr()
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
                    "S": str(message['date'])
                }
            })
        return None

    def endCardMove(self, eventMsg):

        message = eventMsg['message']

        self.updateDbCardPosition(message)
        return None

    def endGroupMove(self, eventMsg):
        groupObj = eventMsg['message']['group']

        self.updateDbGroupPosition(groupObj)
        return None

    def endCardMoveBulk(self, eventMsg):

        message = eventMsg['message']

        self.updateDbCardPositionBulk(message)
        return None

    # No longer used. Replaced by
    # getCardMsgFromDbBatch
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
            groupId=dbCard['groupId']['S'],
            faceUp=bool(dbCard['faceUp']['BOOL']),
            ownerId=dbCard['ownerId']['S']
        )
        return message

    def getCardMsgFromDbBatch(self, cardValues):

        keysArr = [
            {
                "gameId": {
                    "S": self._gameId
                },
                "cardValue": {
                    "S": cardValue
                }
            } for cardValue in cardValues
        ]

        getResp = self._dynamoClient.batch_get_item(
            RequestItems={
                self._cardTable: {
                    'Keys': keysArr
                }
            }
        )

        cardResps = getResp['Responses'][self._cardTable]

        ret = [
            dict(
                x=int(cardResp['x']['N']),
                y=int(cardResp['y']['N']),
                z=int(cardResp['z']['N']),
                cardValue=cardResp['cardValue']['S'],
                groupId=cardResp['groupId']['S'],
                faceUp=bool(cardResp['faceUp']['BOOL']),
                ownerId=cardResp['ownerId']['S'],
                date=cardResp['date']['S']
            ) for cardResp in cardResps
        ]

        return ret

    def updateDbPlayer(self, updateObj):
        playerId = updateObj['playerId']

        dbObj = dict(date=dict(
            Value=dict(S=self._getCurUtcStr()),
            Action='PUT'
        ))

        if 'playerName' in updateObj:
            dbObj['playerName'] = dict(
                Value=dict(S=str(updateObj['playerName'])),
                Action='PUT'
            )

        self._dynamoClient.update_item(
            TableName=self._playerTable,
            Key=dict(
                gameId=dict(S=self._gameId),
                playerId=dict(S=playerId),
            ),
            AttributeUpdates=dbObj)

    def getDbPlayer(self, playerId):
        getResp = self._dynamoClient.get_item(
            TableName=self._playerTable,
            Key={
                "gameId": {
                    "S": self._gameId
                },
                "playerId": {
                    "S": playerId
                }
            }
        )

        if 'Item' in getResp:
            dbPlayer = getResp['Item']
            playerName = dbPlayer['playerName']['S']
        else:
            playerName = ''
        message = dict(
            playerId=playerId,
            playerName=playerName
        )
        return message

    def updateDbGroupPosition(self, updateObj):
        groupId = updateObj['groupId']
        dbObj = dict()

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
        if 'text' in updateObj:
            dbObj['text'] = dict(
                Value=dict(S=str(updateObj['text'])),
                Action='PUT'
            )
        if 'date' in updateObj:
            dbObj['date'] = dict(
                Value=dict(S=str(updateObj['date'])),
                Action='PUT'
            )

        self._dynamoClient.update_item(
            TableName=self._groupTable,
            Key=dict(
                gameId=dict(S=self._gameId),
                groupId=dict(S=groupId),
            ),
            AttributeUpdates=dbObj)

    def updateDbCardPosition(self, updateObj):
        cardValue = updateObj['cardValue']
        dbObj = dict()
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
                Value=dict(S=str(updateObj['groupId'])),
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
        if 'date' in updateObj:
            dbObj['date'] = dict(
                Value=dict(S=str(updateObj['date'])),
                Action='PUT'
            )

        self._dynamoClient.update_item(
            TableName=self._cardTable,
            Key=dict(
                gameId=dict(S=self._gameId),
                cardValue=dict(S=cardValue),
            ),
            AttributeUpdates=dbObj)

    def updateDbCardPositionBulk(self, updateObj):

        cards = updateObj['cards']

        while len(cards) > 0:
            # AWS limit of 25 items per batch
            toPush = cards[:25]
            cards = cards[25:]

            toSend = [
                dict(
                    PutRequest=dict(
                        Item=self._getAttrForBulk(card))
                ) for card in toPush
            ]

            self._dynamoClient.batch_write_item(
                RequestItems={self._cardTable: toSend}
            )
        return 'Done'

    def _getAttrForBulk(self, cardObj):
        ret = dict(
            gameId=dict(S=self._gameId),
            cardValue=dict(S=cardObj['cardValue'])
        )
        if 'x' in cardObj:
            ret['x'] = dict(N=str(cardObj['x']))

        if 'y' in cardObj:
            ret['y'] = dict(N=str(cardObj['y']))

        if 'z' in cardObj:
            ret['z'] = dict(N=str(cardObj['z']))

        if 'groupId' in cardObj:
            ret['groupId'] = dict(S=str(cardObj['groupId']))

        if 'ownerId' in cardObj:
            ret['ownerId'] = dict(S=str(cardObj['ownerId']))

        if 'faceUp' in cardObj:
            ret['faceUp'] = dict(BOOL=bool(cardObj['faceUp']))

        if 'date' in cardObj:
            ret['date'] = dict(S=str(cardObj['date']))

        return ret

    def recallAndShuffleDb(self, deckGroup, initX, initY, curDate):

        cardValues = self._cardValues.copy()

        random.shuffle(cardValues)
        i = 0
        cardsToSend = []
        while len(cardValues) > 0:
            cardValue = cardValues.pop()
            objToSend = dict(
                cardValue=cardValue,
                x=initX,
                y=initY,
                z=i,
                groupId=deckGroup,
                faceUp=False,
                ownerId='',
                date=curDate)
            cardsToSend.append(objToSend)
            i += 1
        # refactored to bulk
        self.updateDbCardPositionBulk(dict(cards=cardsToSend))

    def _initializeCardValues(self):
        cardValues = []
        for suit in ['H', 'D', 'S', 'C']:
            for value in ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']:
                cardValue = f'{value}{suit}'
                cardValues.append(cardValue)

        return cardValues

    def _getCurUtcStr(self):
        return datetime.utcnow().isoformat() + 'Z'
