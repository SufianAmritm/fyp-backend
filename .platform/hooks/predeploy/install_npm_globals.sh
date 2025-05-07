#!/bin/bash
set -e  # Exit on error
sudo chmod +x .platform/hooks/predeploy/install_npm_globals.sh

# Change ownership to the correct user (e.g., webapp)
sudo chown -R webapp:webapp /var/app/current

# Set the correct permissions (make sure directories are executable, files readable)
sudo find /var/app/current -type d -exec chmod 755 {} \;
sudo find /var/app/current -type f -exec chmod 644 {} \;

# Install pnpm globally
sudo npm install -g pnpm

# Set up PNPM path
export PNPM_HOME="/home/webapp/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Install project dependencies
cd /var/app/current
sudo pnpm install
