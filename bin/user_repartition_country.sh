#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo ""
echo "---------"
echo "ROLES"
jq -cr '.collections[].data[].role' ${SCRIPT_DIR}/../data/t6db-users__pink.json | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "DEVICES"
jq -cr '.collections[].data[].device' ${SCRIPT_DIR}/../data/t6db-users__pink.json | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "COUNTRIES"
jq -cr '.collections[].data[].location.geo.country' ${SCRIPT_DIR}/../data/t6db-users__pink.json | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "TIMEZONE"
jq -cr '.collections[].data[].location.geo.timezone | select(. != null)' ${SCRIPT_DIR}/../data/t6db-users__pink.json | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "USER IPs"
#jq -cr '(.collections[0].data[]).geoip.ip | select(.email == "xxxxxxx") | select(. != null)' ${SCRIPT_DIR}/../data/t6db-users__pink.json
jq -cr '(.collections[0].data[]).geoip.ip | select(. != null)' ${SCRIPT_DIR}/../data/t6db-users__pink.json


echo ""
echo "---------"
echo "USER SUBSCRIPTION"
totalUsers="$(jq -cr '.collections[].data[] | select(. != null)' ${SCRIPT_DIR}/../data/t6db-users__pink.json | wc -l)"
echo "- total Users: ${totalUsers}."
changePassword="$(jq -cr '.collections[].data[].subscription.changePassword | select(. != null)' ${SCRIPT_DIR}/../data/t6db-users__pink.json | wc -l)"
echo "- changePassword: ${changePassword} subscribers."
newsletter="$(jq -cr '.collections[].data[].subscription.newsletter | select(. != null)' ${SCRIPT_DIR}/../data/t6db-users__pink.json | wc -l)"
echo "- newsletter: ${newsletter} subscribers."
monthlyreport="$(jq -cr '.collections[].data[].subscription.monthlyreport | select(. != null)' ${SCRIPT_DIR}/../data/t6db-users__pink.json | wc -l)"
echo "- monthlyreport: ${monthlyreport} subscribers."
reminder="$(jq -cr '.collections[].data[].subscription.reminder | select(. != null)' ${SCRIPT_DIR}/../data/t6db-users__pink.json | wc -l)"
echo "- reminder: ${reminder} subscribers."




