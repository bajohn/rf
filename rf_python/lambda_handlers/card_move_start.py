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
    event_msg = helpers.get_event_msg()
    helpers.broadcast_message(event_msg)
    helpers.start_card_move(event_msg)

    return {"statusCode": 200}
