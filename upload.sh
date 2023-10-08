#!/bin/bash

# Default commit message if no argument is provided
default_commit_message="upload"

# Use the provided argument or the default commit message
commit_message="${1:-$default_commit_message}"

git add *
git commit -m "$commit_message"
git push