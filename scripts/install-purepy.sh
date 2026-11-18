#!/bin/bash

set -euo pipefail

version=$(cat .purepy-version)

releases="https://github.com/pure-py/isabelle-purepy/releases/download"

uv pip install --target src/lib/python "purepy @ $releases/v$version/purepy-$version-py3-none-any.whl"
