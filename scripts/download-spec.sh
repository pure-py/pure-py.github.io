#!/bin/bash

set -euo pipefail

version=$(cat .purepy-version)

filename="PurePy-spec.pdf"

if [ "${ANONYMOUS:-}" = true ]; then
    filename="spec-anon.pdf"
fi

url="https://pure-py.github.io/pure-py-spec/v$version/$filename"
dst="static/spec.pdf"

curl -L "$url" -o "$dst"
