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
    message = helpers.get_event_msg()
    helpers.start_card_move(message)
    helpers.broadcast_message(message)
    return {"statusCode": 200}
