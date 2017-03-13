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
	../public/css/font-awesome/font-awesome.min-4.7.0.css \
	../public/css/t6.css \
	> ../public/css/t6.min.css
	
echo Stylesheet minify: Completed