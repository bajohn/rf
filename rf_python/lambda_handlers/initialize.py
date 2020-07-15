import logging
import boto3
import json
from datetime import datetime

from rf_python.helpers.helpers import Helpers

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Hit by 'initialize' endpoint when user enters
# a room (ie http://localhost:4200/qojdqf)
def handler(event, context):
    logger.log(logging.INFO, json.dumps(event))

    helpers = Helpers(event)
    helpers.initiateConnection()
    # helpers.sendConnectionId()

    return {"statusCode": 200}


