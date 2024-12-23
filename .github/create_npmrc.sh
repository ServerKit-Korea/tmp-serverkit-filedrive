#!/bin/bash

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
  echo "GitHub CLI (gh) is not installed. Please install it and try again."
  exit 1
fi

# Use GITHUB_TOKEN for non-interactive authentication
if [ -z "$GITHUB_TOKEN" ]; then
  echo "GITHUB_TOKEN is not set. Please ensure it is passed to this script. Exiting."
  exit 1
fi

# Authenticate GitHub CLI
echo "Authenticating GitHub CLI using GITHUB_TOKEN..."
echo "$GITHUB_TOKEN" | gh auth login --with-token

# Fetch GitHub Token
echo "Fetching GitHub authentication token..."
TOKEN=$(gh auth token)

if [ -z "$TOKEN" ]; then
  echo "Failed to retrieve GitHub token. Exiting."
  exit 1
fi

# Fetch package name from package.json
PACKAGE_NAME=$(jq -r '.name' package.json)

if [ -z "$PACKAGE_NAME" ] || [[ "$PACKAGE_NAME" == "null" ]]; then
  echo "Failed to retrieve package name from package.json. Ensure 'name' field is set."
  exit 1
fi

# Extract scope from package name (if available)
if [[ "$PACKAGE_NAME" == @*/* ]]; then
  SCOPE=$(echo "$PACKAGE_NAME" | cut -d'/' -f1)
else
  echo "Package name '$PACKAGE_NAME' does not include a scope. Skipping scope-specific registry configuration."
  SCOPE=""
fi

# Create .npmrc file in project root
NPMRC_PATH="$HOME/.npmrc"
echo "Configuring npm authentication at $NPMRC_PATH..."
if [ -n "$SCOPE" ]; then
  echo "$SCOPE:registry=https://npm.pkg.github.com" > "$NPMRC_PATH"
fi
echo "//npm.pkg.github.com/:_authToken=${TOKEN}" >> "$NPMRC_PATH"

# Confirm .npmrc file creation
if [ -f "$NPMRC_PATH" ]; then
  echo ".npmrc file created successfully at $NPMRC_PATH"
else
  echo "Failed to create .npmrc file. Exiting."
  exit 1
fi
