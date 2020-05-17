import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Getting player...')
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    eventMsg = helpers.getEventMsg()
    playerId = eventMsg['message']['playerId']
    playerMsg = helpers.getDbPlayer(playerId)
    helpers.sendMsg(dict(
        action='get-player',
        message=playerMsg
    ), toSelf=True)

    return {"statusCode": 200}
