#!/bin/bash
# A UNIX / Linux shell script to send a notification to t6 (https://www.internetcollaboratif.info).
# Tested in Debian and Raspbian.
# -------------------------------------------------------------------------
# Copyright (c) 2022 Mathieu Lory <mathieu@internetcollaboratif.info>
# This script is licensed under GNU GPL version 3.0 or above
# -------------------------------------------------------------------------
# Last updated on : Jun-2022 - Script created.
# -------------------------------------------------------------------------



source /home/mathieu/Scripts/fail2ban2t6.secret.conf




# Display usage information
function show_usage {
  echo "Usage: $0 action <ip>"
  echo "Where action is start, stop, ban, unban"
  echo "and ip is optional passed to ban, unban"
  exit
}


function auth {
  bearer=$(curl -s --user-agent ${T6_USER_AGENT} -X POST "$T6_HOST_PROD/v${T6_API_VER}/authenticate" --header 'Content-Type: application/json' \
  --data-raw '{ "username": "'$T6_USER'", "password": "'$T6_PASS'" }' | jq -r '.token')
}

# Actually send sms
# Expects the sms content (body) to be passed
# as argument.
function send_sms {
  /usr/bin/curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$sid/SMS/Messages.json" -d "From=$from" -d "To=$to" -d "Body=$1" -u "$sid:$token" >> '/dev/null'
  exit
}

function banip {
  local bearer=0
  auth
  text=$([ "$1" != '' ] && echo "Fail2ban just banned $1" || echo "Fail2ban just banned an ip." )
  payload='{"flow_id":"'$T6_FLOW_ID'", "value": "'"$1"'", "text": "'"$text"'", "save": "true", "publish": "true"}'
  echo "=============="
  curl --user-agent ${T6_USER_AGENT} -X POST "$T6_HOST_PROD/v${T6_API_VER}/data/" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Authorization: Bearer ${bearer}" \
    --data-raw "${payload}"
  exit
}

function unbanip {
  local bearer=0
  auth
  text=$([ "$1" != '' ] && echo "Fail2ban just unbanned $1" || echo "Fail2ban just unbanned an ip." )
  payload='{"flow_id":"'$T6_FLOW_ID'", "value": "'"$1"'", "text": "'"$text"'", "save": "true", "publish": "true"}'
  echo "=============="
  curl --user-agent ${T6_USER_AGENT} -X POST "$T6_HOST_PROD/v${T6_API_VER}/data/" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Authorization: Bearer ${bearer}" \
    --data-raw "${payload}"
  exit
}


# Check for script arguments
if [ $# -lt 1 ]
then
  show_usage
fi



# Take action depending on argument
if [ "$1" = 'start' ]
then
  message='Fail2ban+just+started.'
  send_sms $message
elif [ "$1" = 'stop' ]
then
  message='Fail2ban+just+stopped.'
  send_sms $message
elif [ "$1" = 'banip' ]
then
  banip $2
elif [ "$1" = 'unbanip' ]
then
  unbanip $2
elif [ "$1" = 'auth' ]
then
  auth
else
  show_usage
fi
