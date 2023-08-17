#!/bin/bash

# Check if an argument is provided
if [ -z "$1" ]; then
  echo "Usage: sh upload.sh <commit_message>"
  exit 1
fi

# Commit message provided as the first argument
commit_message="$1"

git add *
git commit -m "$commit_message"
git push