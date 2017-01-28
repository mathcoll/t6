#!/bin/sh

apidoc -i ../routes/ -o ../docs/docs/ -f index.js -f data.js -f datatypes.js -f flows.js -f objects.js -f units.js -f users.js --template ../docs/template/
