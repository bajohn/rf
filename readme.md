# RF
Really Fun card game implemented on AWS. 



## TODO
- Broadcast all positions on reconnect (or first connect)

- z index: maximize on click
- group id: every card starts with group "null", but should also have a settable group id 
- Concept of stacking: highlight when hovering over a card, then add to stack

- add api gateway trust to ian_for_rf
- move border: stop cards from being able to move outside screen
- heartbeat, show when connection is dead
- any way to verify accuracy of cards? Could use heartbeat + some hash of cards
    - hash of cards concept- frontend and backend can hash the card states. When the frontend receives an update, 
    the update includes a hash, then the frontent calculates a hash itself and compares (what if
    frontend) updates in the meantime though?

- manage player connections with place on table and shelf



## Lock logic. Omitting for now, may not be needed

- Player 1 starts moving a card at time A
- Player 2 starts moving the same card at time B
- Due to latency, Player 2's move arrives at backend first. This move is stored in DB with time B
- Player 1's move finally arrives. However, because time B > time A, Player 1's move is not recorded. The time B move IS broadcasted back to Player 2, to synchronize.

## Notes

API Gateway V2 (using websockets) is not included in Terraform configuration due to lack of Terraform support.

See AWS Websocket Timing Google sheet for timings.
Full send/receive loops takes approx 500 ms with 128mb lambda,
200ms with 1024 mb Lambda. Leaving low memory for now, and should check
whether removing logging increases speed further.

Credit: favicon.ico from [icons8.com](icons8.com)


Pull cards from here:
https://commons.wikimedia.org/wiki/Category:SVG_playing_cards