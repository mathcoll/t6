echo Starting Minification ...
echo "========================"
echo "Using uglifyjs version:"
uglifyjs -V
echo ""

echo 0. PWA Javascript T6 concat:
cat \
	../public/js/t6app-main.js \
	../public/js/resources/t6-objects.js \
	../public/js/resources/t6-flows.js \
	../public/js/resources/t6-snippets.js \
	../public/js/resources/t6-dashboards.js \
	../public/js/resources/t6-rules.js \
	../public/js/resources/t6-mqtts.js \
	../public/js/resources/snippets/valueDisplay.js \
	> ../public/js/t6app-min.js
echo Completed
echo ""

echo 1. PWA Javascript T6 minify:
uglifyjs \
	../public/js/t6app-main.js \
	../public/js/resources/t6-objects.js \
	../public/js/resources/t6-flows.js \
	../public/js/resources/t6-snippets.js \
	../public/js/resources/t6-dashboards.js \
	../public/js/resources/t6-rules.js \
	../public/js/resources/t6-mqtts.js \
	../public/js/resources/snippets/valueDisplay.js \
	-o ../public/js/t6app-min.js \
	-m -c warnings=false
echo Completed
echo ""

echo 2. PWA Javascript T6-VENDOR minify:
uglifyjs \
	../public/js/vendor/material/material.js \
	../public/js/vendor/mdl/mdl-selectfield.min.js \
	../public/js/vendor/jquery/jquery-3.3.1.min.js \
	../public/js/vendor/flot/jquery.flot.js \
	../public/js/vendor/flot/jquery.flot.time.min.js \
	../public/js/vendor/moment/moment.min-2.22.2.js \
	../public/js/vendor/OpenLayers/ol-4.6.5.min.js \
	-o ../public/vendor.min.js \
	-m -c warnings=false
echo Completed
echo ""

echo 3. PWA Stylesheet minify: 
uglifycss \
	../public/css/vendor/material/material.css \
	../public/css/vendor/material/material.brown-blue.min-1.3.0.css \
	../public/css/t6app.css \
	../public/css/vendor/OpenLayers/ol-4.6.5.css \
	> ../public/css/t6app.min.css
echo Completed
echo ""

echo 4. Old site? Javascript minify:
uglifyjs \
	../public/js/vendor/jquery/jquery-3.3.1.min.js \
	../public/js/t6.js \
	-o ../public/js/t6.min.js \
	-m -c warnings=false
echo Completed
echo ""

echo 5. Old site? Stylesheet minify:
uglifycss \
	../public/css/t6.css \
	> ../public/css/t6.min.css
echo Completed
echo ""

echo Full Minification Completed.