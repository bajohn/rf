import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# This is no longer used, in favor of the frontend doing
# the shuffling
def handler(event, context):
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    helpers.recallAndShuffleDb()
    # helpers.sendCurrentCards(msgSelf=True, broadcast=True)
    return {"statusCode": 200}
