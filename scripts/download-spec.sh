#!/bin/bash
set -euo pipefail

# Download anonymised specification and files defining anonymised names of project and related languages

# Specification version of the pinned reference implementation
version=$(grep -oE '^[0-9]+\.[0-9]+\.[0-9]+' .purepy-version)
sources="https://raw.githubusercontent.com/pure-py/pure-py-spec/v$version"

curl -fL "https://pure-py.github.io/pure-py-spec/v$version/spec-anon.pdf" -o static/spec-anon.pdf
mkdir -p src/lib/spec
curl -fL "$sources/.anon-name" -o src/lib/spec/anon-name
curl -fL "$sources/tex/macros.tex" -o src/lib/spec/macros.tex
