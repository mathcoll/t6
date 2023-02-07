#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "COUNTRIES"
jq .collections[].data[].location.geo.country ${SCRIPT_DIR}/../data/t6db-users__pink.json | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 


echo ""
echo "---------"
echo "TIMEZONE"
jq .collections[].data[].location.geo.timezone ${SCRIPT_DIR}/../data/t6db-users__pink.json | awk -F, '{a[$1]++;}END{for (i in a)print i, a[i];}' | sort -k 2 -nr 