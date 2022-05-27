#!/bin/bash

DIR=`dirname "$0"`
echo "COUNTRIES"
jq .collections[].data[].location.geo.country ${DIR}/../data/t6db-users__pink.json

echo "---------"
echo "TIMEZONE"
jq .collections[].data[].location.geo.timezone ${DIR}/../data/t6db-users__pink.json