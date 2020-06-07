import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Heartbeat received...')
    logger.log(logging.INFO, json.dumps(event))
    helpers = Helpers(event)
    # Do we need to record this anywhere?

    eventMsg = helpers.getEventMsg()

    eventMsg['message']['serverTime'] = helpers.getCurDate()

    helpers.sendMsg(dict(
        action='heartbeat',
        message=eventMsg
    ), toSelf=True)

    return {"statusCode": 200}
