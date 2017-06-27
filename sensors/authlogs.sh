#!/bin/bash
api="http://127.0.0.1:3000/v2.0.1/data/"
publish="true"
save="true"
bearer="productionGFlWfiCrebUZLSAbvn.SElHPXthdKDdFIWuM..INsPLBEtYpXntZwpBYXvKrE.xg"

flow_id=1
timestamp=`date +%s`
mqtt_topic="couleurs/pink/auth_log"
unit=""
root=$(dirname $0)

# Petite astuce sympa pour éviter d'avoir des fichiers temporaires trop bavards!
umask 077
TEMPFILE=`mktemp /tmp/server_check.tmp.XXXXXXXX`
trap "/bin/rm -f $TEMPFILE" EXIT

# Stockage de la variable date dans DATUM
export LC_TIME="en_GB.utf8"
MM=`date +'%b '`
DATUM=`expr substr $MM 1 3`

# On recherche les occurrences FAILED et root dans le /var/log/messages
# à adapter suivant l'os et le type d'enregistrement des logs
#cat /var/log/messages | grep "$DATUM" | grep "FAILED" | grep "root" > $TEMPFILE
cat /var/log/auth.log | grep "authentication failure" | grep -i "$DATUM `date +'%e'`" >> $TEMPFILE
value=`cat $TEMPFILE | wc -l`

#echo `date +'%e'`
#echo $DATUM
echo $value


#curl -i \
#-A "t6 Bash file" \
#-H "Accept: application/json" \
#-H "Content-Type:application/json" \
#-H "Authorization: Bearer $bearer" \
#-X POST $api \
#--data '{"flow_id":"'"$flow_id"'", "value":"'"$value"'", "timestamp": "'"$timestamp"000'", "publish": "'"$publish"'", "save": "'"$save"'", "unit": "'"$unit"'", "mqtt_topic": "'"$mqtt_topic"'"}'
