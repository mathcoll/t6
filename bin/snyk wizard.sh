#!/bin/sh

npm update snyk
snyk wizard
npm i --package-lock-only
npm audit

npm outdated
#npm --depth 9999 update