#!/bin/bash

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

jsonapitest \
	$SCRIPT_DIR/../test/pwa.json \
	$SCRIPT_DIR/../test/t6main.json \
	$SCRIPT_DIR/../test/objects.json \
	$SCRIPT_DIR/../test/flows.json \
	$SCRIPT_DIR/../test/rules.json \
	$SCRIPT_DIR/../test/classifications.json \
	$SCRIPT_DIR/../test/datapoints.json \
	$SCRIPT_DIR/../test/datapoints-timestamps.json \
	$SCRIPT_DIR/../test/snippets.json \
	$SCRIPT_DIR/../test/dashboards.json \
	$SCRIPT_DIR/../test/sources.json \
	$SCRIPT_DIR/../test/stories.json \
	$SCRIPT_DIR/../test/exploration.json \
	$SCRIPT_DIR/../test/admin.json \
	$SCRIPT_DIR/../test/jobs.json \
	$SCRIPT_DIR/../test/models.json \
	$SCRIPT_DIR/../test/users.json \
	$SCRIPT_DIR/../test/cleaning.json
#	$SCRIPT_DIR/../test/audits.json \

suite="$(jq -cr '.[0].suite' $SCRIPT_DIR/../jsonapitest-results.json)"
errors="$(jq -cr '.[] | select(.errors != [])' $SCRIPT_DIR/../jsonapitest-results.json | wc -l)"
errorList="$(jq -cr '.[] | select(.errors != []) | .test, .suite, .api_call.it, .test_description, .response.status, .response.body, .errors, .api_call.method, .api_call.request.url, .api_call.request.headers' $SCRIPT_DIR/../jsonapitest-results.json)"
test="$(jq -cr '. | length' $SCRIPT_DIR/../jsonapitest-results.json)"
echo ""
echo "REPORT :"
echo "- ${suite}"
echo "- ${test} test(s)"
echo "- ${errors} error(s)"
echo "- ${errorList}"