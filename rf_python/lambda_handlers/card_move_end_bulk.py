import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Ending card move bulk...')
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    eventMsg = helpers.getEventMsg()
    eventMsg = _setDates(eventMsg, helpers)
    
    helpers.sendMsg(eventMsg, toOthers=True)
    helpers.endCardMoveBulk(eventMsg)
    return {"statusCode": 200}


def _setDates(eventMsg, helpers):
    message = eventMsg['message']
    cards = message['cards']
    for card in cards:
        card['date'] = helpers.getCurDate()
    return eventMsg
