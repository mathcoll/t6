#!/bin/bash
api="http://127.0.0.1:3000/v2.0.1/data/"
publish="true"
save="true"
bearer=""

flow_id=""
timestamp=`date +%s`
mqtt_topic=""
unit="%"

value=`ps aux | awk '{sum +=$3}; END {print sum}'`;

if [ `echo $value'>'0 | bc -l` ]
then
	curl -i \
	-A "t6 Bash file" \
	-H "Accept: application/json" \
	-H "Content-Type:application/json" \
	-H "Authorization: Bearer $bearer" \
	-X POST $api \
	--data '{"flow_id":"'"$flow_id"'", "value":"'"$value"'", "timestamp": "'"$timestamp"000'", "publish": "'"$publish"'", "save": "'"$save"'", "unit": "'"$unit"'", "mqtt_topic": "'"$mqtt_topic"'"}'
fi