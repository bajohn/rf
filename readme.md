# RF
Really Fun card game implemented on AWS. 



## TODO

- Card UI  updates are working. Needs lots of testing to make sure lock id works
- Disable card drag in UI when lock ID is transmitted from a cord-move-start message
- Modularize lambda tf
- Reduce lambda timeout (to 10 seconds or less, typical duration is <1.5 seconds)

## Notes

API Gateway V2 (using websockets) is not included in Terraform configuration due to lack of Terraform support.

Credit: favicon.ico from [icons8.com](icons8.com)


Pull cards from here:
https://commons.wikimedia.org/wiki/Category:SVG_playing_cards