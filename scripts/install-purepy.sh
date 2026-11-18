#!/bin/bash
set -euo pipefail

version=$(cat .purepy-version)
uv pip install --target src/vendor/python \
    "purepy @ https://github.com/pure-py/isabelle-purepy/releases/download/v$version/purepy-$version-py3-none-any.whl"
