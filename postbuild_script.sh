#!/usr/bin/env bash
#
# postbuild_script, cos' no dependencies & can't seem to do some s**t otherwise


mv bin/teetoes-cli.js bin/teetoes
chmod +x bin/teetoes

# inject version to script
TEETOES_VERSION=$(jq -r '.version' package.json)
sed -i "s/~TEETOES_VERSION~/$TEETOES_VERSION/" bin/teetoes
