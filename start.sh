#!/usr/bin/env bash
# Open Apple iOS 26 Liquid Glass Calculator in default browser

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
INDEX_FILE="$DIR/index.html"

if [[ "$OSTYPE" == "darwin"* ]]; then
  open "$INDEX_FILE"
elif which xdg-open > /dev/null; then
  xdg-open "$INDEX_FILE"
else
  echo "Open $INDEX_FILE in any modern browser."
fi
