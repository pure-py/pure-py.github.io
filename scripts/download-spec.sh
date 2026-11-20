#!/bin/bash
set -euo pipefail

# Download anonymised specification files; fails after 0.27.10, since later versions don't publish them
version=$(grep -oE '^[0-9]+\.[0-9]+\.[0-9]+' .purepy-version)
sources="https://raw.githubusercontent.com/pure-py/pure-py-spec/v$version"

curl -fL "https://pure-py.github.io/pure-py-spec/v$version/spec-anon.pdf" -o static/spec-anon.pdf
mkdir -p src/lib/spec
curl -fL "$sources/.anon-name" -o src/lib/spec/anon-name
curl -fL "$sources/tex/macros.tex" -o src/lib/spec/macros.tex
