#!/bin/bash

set -euo pipefail

version=$(cat .purepy-version)

filename="PurePy-spec.pdf"

if [ "${ANONYMOUS:-}" = true ]; then
    filename="spec-anon.pdf"
fi

url="https://pure-py.github.io/pure-py-spec/v$version/$filename"
dst="static/$filename"

curl -L "$url" -o "$dst"

# Specification macros defining anonymised names of related languages
if [ "${ANONYMOUS:-}" = true ]; then
    mkdir -p src/lib/spec
    curl -fL "https://raw.githubusercontent.com/pure-py/pure-py-spec/v$version/tex/macros.tex" \
        -o src/lib/spec/macros.tex
fi
