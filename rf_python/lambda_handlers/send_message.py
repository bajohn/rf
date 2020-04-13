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
    msg_obj = helpers.get_event_msg()
    helpers.broadcast_message(msg_obj)
    return {"statusCode": 200}
