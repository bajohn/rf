import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Starting card move...')
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    event_msg = helpers.getEventMsg()
    helpers.messageBroadcast(event_msg)
    helpers.startCardMove(event_msg)

    return {"statusCode": 200}
