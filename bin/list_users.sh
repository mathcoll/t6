#!/bin/bash

# xclip -selection clipboard -i < db-pink.json

# xclip -selection clipboard -i < db-pink.json
#jq '.collections[0].data[].email' < ../data/t6db-users__pink.json


jq '.collections[0].data[] | {email: .email, subscription_date: .subscription_date, reminderMail: .reminderMail, unsubscription: .unsubscription}' < ../data/t6db-users__pink.json

