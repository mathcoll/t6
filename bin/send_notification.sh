#!/bin/bash

endpoint="https://fcm.googleapis.com/fcm/send/cyeoOA0IV-Q:APA91bFpPWXqFwbbcHe-dwNh9Hzxa9QwD2c_F0pqKLIL5F24jvzKt0ABX7V8NMEANBzY6kkk6le-xBq5aT699xjsEb6cBC3MkRZnfYCHb5697zuzssU32y79AGL6bXhp6kKyRr3dOx_k"
key="BOlDZicOevpVeGUyC7bbVnrs-gLy82L9txyzbMCTFUl4-WR_7ZjJ8jnekF2kM8uwntF8mkWTgIn0e8WhSPVJkeY="
auth="JCnBRkJQ2AzTgdeE5BRHBQ=="
pvtkey=""
pubkey="BHa70a3DUtckAOHGltzLmQVI6wed8pkls7lOEqpV71uxrv7RrIY-KCjMNzynYGt4LJI9Dn2EVP3_0qFAnVxoy6I"
payload="Hello Dear"
subject="mailto:"
ttl=3600

web-push send-notification --endpoint=$endpoint --key=$key --auth=$auth --payload=$payload --ttl=$ttl --vapid-subject=$subject --vapid-pubkey=$pubkey --vapid-pvtkey=$pvtkey --gcm-api-key=


