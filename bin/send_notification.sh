#!/bin/bash

endpoint="https://updates.push.services.mozilla.com/wpush/v2/gAAAAABZbPuhjAuTsCcvekedNcr808SktPQZ3a0MQpFKemZbCGA103kgV8P4DPm0SztRP7a-Gj6Xy_LhnKWIXlEbP1gd_SnjASwtUcpKXjyksm4waGdCZbiQreza1NVpK1m7a-MUBbvavDcHf75XU7nvA90cpNusCXouM4Sv7MlAtiqZH39I6pU"
key="BL5Kbmfx44RIVgf4HIZnZNDZ8W_CwXRQn3_L_yx2oY4pFbIvoToLpYXG1Vasy9w9wC-dyG2NkbBF-n-DiMW_JfE"
auth="x3ErTV8S_-vaWVllOdTzeA=="
pvtkey=""
pubkey="BHa70a3DUtckAOHGltzLmQVI6wed8pkls7lOEqpV71uxrv7RrIY-KCjMNzynYGt4LJI9Dn2EVP3_0qFAnVxoy6I"
payload="{\"type\": \"message\", \"title\": \"This is a test of notification\", \"body\": \"Hello Dear\", \"icon\": null}"
subject="mailto:"
ttl=3600

web-push send-notification --endpoint=$endpoint --key=$key --auth=$auth --payload="$payload" --ttl=$ttl --vapid-subject=$subject --vapid-pubkey=$pubkey --vapid-pvtkey=$pvtkey --gcm-api-key=


