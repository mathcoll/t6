#!/bin/sh

npm update snyk
snyk wizard
# following line commented on 13.01.2022
#npm i --package-lock-only
npm audit

npm outdated
#npm --depth 9999 update