import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Connecting...')
    logger.log(logging.INFO, json.dumps(event))
    
    return {"statusCode": 200}
