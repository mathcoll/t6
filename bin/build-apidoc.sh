#!/bin/bash

../node_modules/apidoc/bin/apidoc \
	-i /home/mathieu/Projets/2019/internetcollaboratif.info/t6/routes/ \
	-f audits.js \
	-f data.js \
	-f datatypes.js \
	-f ota.js \
	-f mqtts.js \
	-f rules.js \
	-f dashboards.js \
	-f snippets.js \
	-f flows.js \
	-f uis.js \
	-f objects.js \
	-f units.js \
	-f users.js \
	-f exploration.js \
	-f notifications.js \
	-f classifications.js \
	-f models.js \
	-f stories.js \
	-f index.js \
	-f jobs.js \
	-f config.js \
	-o /home/mathieu/Projets/2019/internetcollaboratif.info/doc/docs/ \
	--template /home/mathieu/Projets/2019/internetcollaboratif.info/doc/apidoc-master/ \
	--config /home/mathieu/Projets/2019/internetcollaboratif.info/t6/bin/apidoc.json \
	-v \
#	-d \
	
	
#--template /home/mathieu/Projets/2019/internetcollaboratif.info/doc/apidoc-master/ \
#--template /home/mathieu/Projets/2019/internetcollaboratif.info/doc/templatev4/ \
#--template /home/mathieu/Projets/2019/internetcollaboratif.info/doc/templatev5.1/template/ \