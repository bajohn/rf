import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    logger.log(logging.INFO, 'Ending group move...')
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    eventMsg = helpers.getEventMsg()
    helpers.sendMsg(eventMsg, toOthers=True)
    helpers.endGroupMove(eventMsg)
    return {"statusCode": 200}
