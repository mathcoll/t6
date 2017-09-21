#!/bin/bash
DIGEST="sha384"


declare -a files=(
	"../public/css/m/inline.css"
	"../public/css/OpenLayers/ol-4.1.1.min.css"
	"../public/js/m/md5.js"
	"../public/js/m/material.min.js"
	"../public/js/m/mdl-selectfield.min.js"
	"../public/js/m/toast.js"
	"../public/js/vendor/jquery.min.js"
	"../public/js/flot/jquery.flot.js"
	"../public/js/flot/jquery.flot.time.min.js"
	"../public/js/m/moment.min-2.18.1.js"
	"../public/js/OpenLayers/ol-4.1.1.min.js"
	"../public/js/m/t6app.js"
)

for i in "${files[@]}"
do
	echo $i
	echo -n "$DIGEST-"
	cat $i | openssl dgst -$DIGEST -binary | openssl enc -base64 -A
	echo ""
	echo ""
done