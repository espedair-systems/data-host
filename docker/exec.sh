#!/bin/bash

# This script runs the data-host binary using the artifacts staged in this directory.
# It mimics the execution environment of the Docker container.

# Get the directory where this script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

# Set environment variables to point to the local staged directories
export APP_ENV=production
export PORT=8080
export DATA_HOST_PORT=8080
export DATA_HOST_FRONTEND_PATH="$DIR/ui"
export DATA_HOST_DATA_PATH="$DIR/data"

echo "----------------------------------------------------"
echo "Starting data-host exec from staged artifacts"
echo "Frontend Path: $DATA_HOST_FRONTEND_PATH"
echo "Data Path:     $DATA_HOST_DATA_PATH"
echo "----------------------------------------------------"

# Run the binary
"$DIR/bin/data-host"
