import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Sending message...')
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    msg_obj = helpers.getEventMsg()
    helpers.sendMsg(msg_obj, toOthers=True)
    return {"statusCode": 200}
