#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
DATABASE="t6db-users__pink.json"
EMAIL=""

echo ""
echo "---------"
echo "ROLES"
jq -cr '.collections[].data[].role' ${SCRIPT_DIR}/../data/${DATABASE} | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "DEVICES"
jq -cr '.collections[].data[].device' ${SCRIPT_DIR}/../data/${DATABASE} | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "COUNTRIES"
jq -cr '.collections[].data[].location.geo.country' ${SCRIPT_DIR}/../data/${DATABASE} | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "TIMEZONE"
jq -cr '.collections[].data[].location.geo.timezone | select(. != null)' ${SCRIPT_DIR}/../data/${DATABASE} | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "USER IPs"
jq -cr '.collections[0].data[] | select(.geoip.ip != null) | .email, .geoip.ip' ${SCRIPT_DIR}/../data/${DATABASE}


echo ""
echo "---------"
echo "USER LAST LOGON AND OTP"
jq -cr '.collections[0].data[] | select(.lastLogon != null) | {email, lastLogon}' ${SCRIPT_DIR}/../data/${DATABASE}
jq -cr '.collections[0].data[] | select(.lastOTP != null) | {email, lastOTP}' ${SCRIPT_DIR}/../data/${DATABASE}


echo ""
echo "---------"
echo "USER SUBSCRIPTION"
totalUsers="$(jq -cr '.collections[].data[] | select(. != null)' ${SCRIPT_DIR}/../data/${DATABASE} | wc -l)"
echo "- total Users: ${totalUsers}."
changePassword="$(jq -cr '.collections[].data[].subscription.changePassword | select(. != null)' ${SCRIPT_DIR}/../data/${DATABASE} | wc -l)"
echo "- changePassword: ${changePassword} subscribers."
newsletter="$(jq -cr '.collections[].data[].subscription.newsletter | select(. != null)' ${SCRIPT_DIR}/../data/${DATABASE} | wc -l)"
echo "- newsletter: ${newsletter} subscribers."
monthlyreport="$(jq -cr '.collections[].data[].subscription.monthlyreport | select(. != null)' ${SCRIPT_DIR}/../data/${DATABASE} | wc -l)"
echo "- monthlyreport: ${monthlyreport} subscribers."
reminder="$(jq -cr '.collections[].data[].subscription.reminder | select(. != null)' ${SCRIPT_DIR}/../data/${DATABASE} | wc -l)"
echo "- reminder: ${reminder} subscribers."


echo ""
echo "---------"
echo "SPECIFIC USER"
jq -cr --arg email "${EMAIL}" '.collections[0].data[] | select(.email == $email) | {password, firstName, lastName}' ${SCRIPT_DIR}/../data/${DATABASE}


