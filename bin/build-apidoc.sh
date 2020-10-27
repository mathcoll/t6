#!/bin/bash

apidoc -i ../routes/ -o ../docs/docs/ -f exploration.js -f data.js -f datatypes.js -f ota.js -f mqtts.js -f rules.js -f dashboards.js -f snippets.js -f flows.js -f objects.js -f units.js -f users.js -f notifications.js -f index.js --template ../docs/template/
