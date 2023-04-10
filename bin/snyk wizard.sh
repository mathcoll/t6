#!/bin/sh

SCRIPT_DIR="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

npm update snyk
snyk wizard
# following line commented on 13.01.2022
#npm i --package-lock-only
npm audit --production

npm outdated
#npm --depth 9999 update