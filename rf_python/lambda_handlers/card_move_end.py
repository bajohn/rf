import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Ending card move...')
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    event_msg = helpers.get_event_msg()
    logger.log(logging.INFO, 'Broadcasting end card move...')
    helpers.message_broadcast(event_msg)
    helpers.end_card_move(event_msg)
    return {"statusCode": 200}
