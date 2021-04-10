#!/bin/bash

# xclip -selection clipboard -i < db-pink.json
#!/bin/bash

# xclip -selection clipboard -i < db-pink.json
jq '.collections[0].data[].email' < ../data/db-pink.json


jq '.collections[0].data[] | {email: .email, unsubscription: .unsubscription}' < ../data/db-pink.json

