import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Creating room...')
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    helpers.createRoom()
    event_msg = helpers.getEventMsg()
    event_msg['message']['success'] = True
    helpers.messageSelf(event_msg)
    return {"statusCode": 200}


