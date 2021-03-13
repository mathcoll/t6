#!/bin/bash

RECIPIENTS="newsletter_recipients.csv"
FROM="mathieu@internetcollaboratif.info"
SUBJECT="t6 JWT notification"
TEMPLATE="newsletter_template.html.sh"
MUTTRC=".muttrc"

if [ ! -f "${RECIPIENTS}" ]; then
     >&2 echo "File ${1} not found"
    exit 1
fi

while read line; do
    NAME=$(echo ${line} | cut -d"," -f1)
    EMAIL=$(echo ${line} | cut -d"," -f2)

    echo "Sending mail to ${NAME} (${EMAIL})"
    ./${TEMPLATE} "${NAME}" ${EMAIL} | mutt -x -e "set content_type=text/html" -F "$MUTTRC" -b "$FROM" -s "${SUBJECT}" ${EMAIL}
done < ${RECIPIENTS}