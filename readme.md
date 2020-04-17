# RF
Really Fun card game implemented on AWS. 



## TODO
- Iterate and test that card component works with all 52 cards
- Card UI  updates are working. Needs lots of testing to make sure lock id works
- Disable card drag in UI when lock ID is transmitted from a cord-move-start message

- After the above two are complete, should be good to start building out playing card logic.

## Notes

API Gateway V2 (using websockets) is not included in Terraform configuration due to lack of Terraform support.

Credit: favicon.ico from [icons8.com](icons8.com)


Pull cards from here:
https://commons.wikimedia.org/wiki/Category:SVG_playing_cards