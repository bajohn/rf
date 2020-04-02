import requests
import logging
import json 
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    logger.log(logging.INFO, 'hellowwwww')
    logger.log(logging.INFO, json.dumps(event))
    
    return {"statusCode": 200}

# interesting paart of log json dumps(event):
# {
#     "requestContext": {
#         "routeKey": "$connect",
#         "messageId": null,
#         "eventType": "CONNECT",
#         "extendedRequestId": "KVmb8FWjoAMFQWg=",
#         "requestTime": "02/Apr/2020:02:42:33 +0000",
#         "messageDirection": "IN",
#         "stage": "dev",
#         "connectedAt": 1585795353168,
#         "requestTimeEpoch": 1585795353170,
#         "identity": {
#             "cognitoIdentityPoolId": null,
#             "cognitoIdentityId": null,
#             "principalOrgId": null,
#             "cognitoAuthenticationType": null,
#             "userArn": null,
#             "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
#             "accountId": null,
#             "caller": null,
#             "sourceIp": "108.48.186.32",
#             "accessKey": null,
#             "cognitoAuthenticationProvider": null,
#             "user": null
#         },
#         "requestId": "KVmb8FWjoAMFQWg=",
#         "domainName": "acyiae8dc2.execute-api.us-east-1.amazonaws.com",
#         "connectionId": "KVmb8fjMIAMCFgQ=",
#         "apiId": "acyiae8dc2"
#     },
#     "isBase64Encoded": false
# }


# {
#     "requestContext": {
#         "routeKey": "subscribe_to_message",
#         "messageId": "KVmcDfjfIAMCFgQ=",
#         "eventType": "MESSAGE",
#         "extendedRequestId": "KVmcDGcCIAMFeiw=",
#         "requestTime": "02/Apr/2020:02:42:33 +0000",
#         "messageDirection": "IN",
#         "stage": "dev",
#         "connectedAt": 1585795353168,
#         "requestTimeEpoch": 1585795353851,
#         "identity": {
#             "cognitoIdentityPoolId": null,
#             "cognitoIdentityId": null,
#             "principalOrgId": null,
#             "cognitoAuthenticationType": null,
#             "userArn": null,
#             "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36",
#             "accountId": null,
#             "caller": null,
#             "sourceIp": "108.48.186.32",
#             "accessKey": null,
#             "cognitoAuthenticationProvider": null,
#             "user": null
#         },
#         "requestId": "KVmcDGcCIAMFeiw=",
#         "domainName": "acyiae8dc2.execute-api.us-east-1.amazonaws.com",
#         "connectionId": "KVmb8fjMIAMCFgQ=",
#         "apiId": "acyiae8dc2"
#     },
#     "body": "{\"action\":\"subscribe_to_message\",\"message\":\"hello world!\"}",
#     "isBase64Encoded": false
# }
