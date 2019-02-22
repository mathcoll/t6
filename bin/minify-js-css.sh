echo Starting Minification ...
echo "========================"
echo ""

echo 0. Old site? Javascript minify:
uglifyjs \
	../public/js/vendor/jquery-3.3.1.min.js \
	../public/js/sortable/sortable.min-1.4.2.js \
	../public/js/bootstrap.js \
	../public/js/t6.js \
	-o ../public/js/t6.min.js \
	-p 5 -m -c warnings=false
echo Completed
echo ""

echo 0. Old site? Stylesheet minify:
uglifycss \
	../public/css/bootstrap.css \
	../public/css/t6.css \
	> ../public/css/t6.min.css
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
	-p 5 -m -c warnings=false
echo Completed
echo ""

echo 2. PWA Javascript T6-VENDOR minify:
uglifyjs \
	../public/js/m/material.js \
	../public/js/m/mdl-selectfield.min.js \
	../public/js/vendor/jquery-3.3.1.min.js \
	../public/js/flot/jquery.flot.js \
	../public/js/flot/jquery.flot.time.min.js \
	../public/js/m/moment.min-2.22.2.js \
	../public/js/OpenLayers/ol-4.6.5.min.js \
	-o ../public/js/m/vendor.min.js \
	-p 5 -m -c warnings=false
echo Completed
echo ""

echo 3. PWA Stylesheet minify: 
uglifycss \
	../public/css/material-design-lite/1.3.0/material.brown-blue.min.css \
	../public/css/m/inline.css \
	../public/css/OpenLayers/ol-4.6.5.css \
	> ../public/css/t6App.min.css
echo Completed
echo ""

echo Full Minification Completed.