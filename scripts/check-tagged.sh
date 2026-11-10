#/bin/bash

set -e

git -C pure-py-spec fetch origin --tags --force
git -C isabelle-purepy fetch origin --tags --force

SPEC_TAG=$(git -C pure-py-spec tag --points-at HEAD)
CHECKER_TAG=$(git -C isabelle-purepy tag --points-at HEAD)

if [ -z "$SPEC_TAG" ]; then
  echo "pure-py-spec is not checked out at an exact tag"
  exit 1
fi

echo "pure-py-spec checked out at $SPEC_TAG"

if [ -z "$CHECKER_TAG" ]; then
  echo "isabelle-purepy is not checked out at an exact tag"
  exit 1
fi

echo "isabelle-purepy checked out at $CHECKER_TAG"
