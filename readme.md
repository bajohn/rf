# RF
Really Fun card game implemented on AWS. 

## TODO
- Add working API Gateway to terraform
- Double check website artifact bucket permissions
- subscribe_to_message route hit successfully although not sure if the "message" is transmitting.
- dynamo db- finish setting up and terraform, to store active connections
    - should create new connection if not exists when the lambda is hit
    - then transmit to all connections. If transmit fails, delete connection from table
## Notes
Credit: favicon.ico from [icons8.com](icons8.com)


Pull cards from here:
https://commons.wikimedia.org/wiki/Category:SVG_playing_cards