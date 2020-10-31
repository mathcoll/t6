#!/bin/sh

echo Starting Minification ...
echo "========================"
echo "Using uglifyjs version:"
../node_modules/uglify-js/bin/uglifyjs -V
echo ""

echo 1. PWA Javascript T6 minify:
../node_modules/uglify-js/bin/uglifyjs \
	../public/js/t6app-main.js \
	../public/js/resources/t6-objects.js \
	../public/js/resources/t6-flows.js \
	../public/js/resources/t6-snippets.js \
	../public/js/resources/t6-dashboards.js \
	../public/js/resources/t6-rules.js \
	../public/js/resources/t6-mqtts.js \
	../public/js/resources/t6-sources.js \
	../public/js/resources/snippets/valueDisplay.js \
	../public/js/resources/snippets/graphDisplay.js \
	../public/js/resources/snippets/flowGraph.js \
	../public/js/resources/snippets/simpleClock.js \
	../public/js/resources/snippets/simpleRow.js \
	../public/js/resources/snippets/cardChart.js \
	../public/js/resources/snippets/sparkline.js \
	--compress \
	--mangle \
	--stats \
	-o ../public/js/t6app-min.js \
	--source-map "filename=t6app-min.js.map,url=t6app-min.js.map,includeSources=true"
echo Completed
echo ""

echo 2. PWA Javascript T6-VENDOR minify:
../node_modules/uglify-js/bin/uglifyjs \
	../public/js/vendor/material/material.js \
	../public/js/vendor/mdl/mdl-selectfield.min.js \
	../public/js/vendor/moment/moment.min-2.24.0.js \
	../public/js/vendor/OpenLayers/ol-4.6.5.min.js \
	../public/js/vendor/Chart/Chart-min-2.9.3.js \
	../public/js/vendor/Leaflet/leaflet-min-1.6.0.js \
	--compress \
	--mangle \
	--stats \
	-o ../public/js/vendor.min.js \
	--source-map "filename=vendor.min.js.map,url=vendor.min.js.map,includeSources=true"
echo Completed
echo ""

echo 3. PWA Stylesheet minify: 
uglifycss \
	../public/css/vendor/material/material.css \
	../public/css/vendor/material/material.brown-blue.min-1.3.0.css \
	../public/css/t6app.css \
	../public/css/vendor/OpenLayers/ol-4.6.5.css \
	../public/css/vendor/Leaflet/leaflet-1.6.0.css \
	> ../public/css/t6app.min.css
echo Completed
echo ""

echo 4. Documentation Javascript minify:
../node_modules/uglify-js/bin/uglifyjs \
	../public/js/vendor/jquery/jquery-3.3.1.min.js \
	../public/js/t6.js \
	--compress \
	--mangle \
	--stats \
	-o ../public/js/t6.min.js
echo Completed
echo ""

echo 5. Documentation Stylesheet minify:
uglifycss \
	../public/css/vendor/bootstrap/bootstrap.css \
	../public/css/t6.css \
	> ../public/css/t6.min.css
echo Completed
echo ""

echo 6. PWA Javascript T6-SHOW minify:
../node_modules/uglify-js/bin/uglifyjs \
	../public/js/vendor/material/material.js \
	../public/js/vendor/mdl/mdl-selectfield.min.js \
	../public/js/t6show.js \
	--compress \
	--mangle \
	--stats \
	-o ../public/js/t6show-min.js \
	--source-map "filename=t6show-min.js.map,url=t6show-min.js.map,includeSources=true"
echo Completed
echo ""


t6BuildVersion=`md5sum ../public/js/t6app-min.js | awk '{print $1}'`
t6BuildDate=`date -R`
echo "{\"t6BuildVersion\": \"${t6BuildVersion}\", \"t6BuildDate\": \"${t6BuildDate}\"}" > ../t6BuildVersion.json
echo t6BuildVersion: $t6BuildVersion
echo t6BuildDate: $t6BuildDate
sed -i "1 s/^.*$/var dataCacheName= 't6-cache-$t6BuildVersion';/i" ../public/service-worker.js
echo Full Minification Completed.