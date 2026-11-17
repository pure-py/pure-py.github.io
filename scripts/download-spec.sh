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

# Specification files defining anonymised names of project and related languages
if [ "${ANONYMOUS:-}" = true ]; then
    sources="https://raw.githubusercontent.com/pure-py/pure-py-spec/v$version"
    mkdir -p src/lib/spec
    curl -fL "$sources/.anon-name" -o src/lib/spec/anon-name
    curl -fL "$sources/tex/macros.tex" -o src/lib/spec/macros.tex
fi
