import requests
import logging
import json 
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    logger.log(logging.INFO, 'hellowwwww')
    logger.log(logging.INFO, json.dumps(event))
    return {"statusCode": 200}
