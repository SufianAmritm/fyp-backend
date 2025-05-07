#!/bin/bash
# Ensure this script is executablee
chmod +x .platform/hooks/prebuild/install_npm_globals.sh

# Install necessary global npm packages

sudo npm install --force
