uglifyjs \
	../public/js/vendor/jquery.min.js \
	../public/js/sortable/sortable.min-1.4.2.js \
	../public/js/bootstrap.js \
	../public/js/t6.js \
	-o ../public/js/t6.min.js \
	-p 5 -m -c warnings=false
echo Javascript minify: Completed

uglifycss \
	../public/css/bootstrap.css \
	../public/css/t6.css \
	> ../public/css/t6.min.css
echo Stylesheet minify: Completed




# PWA version
uglifyjs \
	../public/js/m/material.js \
	../public/js/m/mdl-selectfield.min.js \
	../public/js/vendor/jquery.min.js \
	../public/js/flot/jquery.flot.js \
	../public/js/flot/jquery.flot.time.min.js \
	../public/js/m/moment.min-2.18.1.js \
	../public/js/OpenLayers/ol-4.1.1.min.js \
	-o ../public/js/m/vendor.min.js \
	-p 5 -m -c warnings=false
echo PWA Javascript minify: Completed

uglifycss \
	../public/css/m/inline.css \
	../public/css/material-design-lite/1.3.0/material.brown-blue.min.css \
	../public/css/OpenLayers/ol-4.1.1.min.css \
	> ../public/css/t6App.min.css
echo PWA Stylesheet minify: Completed

