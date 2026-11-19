#!/bin/bash
set -euo pipefail

# Download anonymised specification and files defining anonymised names of project and related languages

# Specification version of the installed reference implementation
version=$(sed -n 's/^Version: //p' src/lib/python/purepy_conformance-*.dist-info/METADATA)
sources="https://raw.githubusercontent.com/pure-py/pure-py-spec/v$version"

curl -fL "https://pure-py.github.io/pure-py-spec/v$version/spec-anon.pdf" -o static/spec-anon.pdf
mkdir -p src/lib/spec
curl -fL "$sources/.anon-name" -o src/lib/spec/anon-name
curl -fL "$sources/tex/macros.tex" -o src/lib/spec/macros.tex
