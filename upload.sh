#!/bin/bash

# Check if an argument is provided
# if [ -z "$1" ]; then
#   echo "Usage: sh upload.sh <commit_message>"
#   exit 1
# fi

# Default commit message if no argument is provided
default_commit_message="upload"

# Use the provided argument or the default commit message
commit_message="${1:-$default_commit_message}"

git add *
git commit -m "$commit_message"
git push