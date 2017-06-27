#!/bin/bash
api="http://127.0.0.1:3000/v2.0.1/users/reminderMail"
bearer=""

curl -i \
-A "t6 Bash file" \
-H "Accept: application/json" \
-H "Content-Type:application/json" \
-H "Authorization: Bearer $bearer" \
-X GET $api \
--data ''