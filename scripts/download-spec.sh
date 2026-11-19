#!/bin/bash
set -euo pipefail

# Download anonymised specification and files defining anonymised names of project and related languages

# Specification version of the installed reference implementation
version=$(sed -n 's/^Version: //p' src/vendor/python/purepy_conformance-*.dist-info/METADATA)
sources="https://raw.githubusercontent.com/pure-py/pure-py-spec/v$version"

curl -fL "https://pure-py.github.io/pure-py-spec/v$version/spec-anon.pdf" -o static/spec-anon.pdf
mkdir -p src/vendor/spec
curl -fL "$sources/.anon-name" -o src/vendor/spec/anon-name
curl -fL "$sources/tex/macros.tex" -o src/vendor/spec/macros.tex
