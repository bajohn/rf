import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    logger.log(logging.INFO, 'Clearing connections...')
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    helpers.clearConnections()
    return {"statusCode": 200}
