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
	../public/js/resources/t6-stories.js \
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

echo 2. PWA Javascript T6-third-party minify:
../node_modules/uglify-js/bin/uglifyjs \
	../public/js/thirdparty/material/material-1.3.0.js \
	../public/js/thirdparty/mdl/mdl-selectfield.min.js \
	../public/js/thirdparty/moment/moment-2.29.1.min.js \
	../public/js/thirdparty/OpenLayers/ol-6.12.0.min.js \
	../public/js/thirdparty/Leaflet/leaflet-1.7.1.min.js \
	--compress \
	--mangle \
	--stats \
	-o ../public/js/thirdparty.min.js \
	--source-map "filename=thirdparty.min.js.map,url=thirdparty.min.js.map,includeSources=true"
echo Completed
echo ""

echo 3. PWA Stylesheet minify: 
uglifycss \
	../public/css/thirdparty/material/material-1.3.0.css \
	../public/css/thirdparty/material/material.brown-blue.min-1.3.0.css \
	../public/css/t6app.css \
	../public/css/thirdparty/OpenLayers/ol-6.12.0.min.css \
	../public/css/thirdparty/Leaflet/leaflet-1.7.1.css \
	> ../public/css/t6app.min.css
echo Completed
echo ""

echo 4. Documentation Javascript minify:
../node_modules/uglify-js/bin/uglifyjs \
	../public/js/thirdparty/jquery/jquery-3.3.1.min.js \
	../public/js/t6.js \
	--compress \
	--mangle \
	--stats \
	-o ../public/js/t6.min.js
echo Completed
echo ""

echo 5. Documentation Stylesheet minify:
uglifycss \
	../public/css/thirdparty/bootstrap/bootstrap.css \
	../public/css/t6.css \
	> ../public/css/t6.min.css
echo Completed
echo ""

echo 6. PWA Javascript T6-SHOW minify:
../node_modules/uglify-js/bin/uglifyjs \
	../public/js/thirdparty/material/material.js \
	../public/js/thirdparty/mdl/mdl-selectfield.min.js \
	../public/js/t6show.js \
	--compress \
	--mangle \
	-b max_line_len=200,beautify=false \
	--stats \
	-o ../public/js/t6show-min.js \
	--source-map "filename=t6show-min.js.map,url=t6show-min.js.map,includeSources=true"
echo Completed
echo ""


t6BuildVersion=$(md5sum ../public/js/t6app-min.js | awk '{print $1}')
t6BuildDate=$(date -R)
echo "{\"t6BuildVersion\": \"${t6BuildVersion}\", \"t6BuildDate\": \"${t6BuildDate}\"}" > ../t6BuildVersion.json
echo t6BuildVersion: $t6BuildVersion
echo t6BuildDate: $t6BuildDate
sed -i "1 s/^.*$/var dataCacheName= \"t6-cache-$t6BuildVersion\";/i" ../public/service-worker.js
echo Full Minification Completed.