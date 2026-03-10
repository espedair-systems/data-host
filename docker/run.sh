#!/bin/bash

# Simple script to run the bundled data-host container locally

# Ensure we have the image
if [[ "$(docker images -q data-host:latest 2> /dev/null)" == "" ]]; then
    echo "Image not found. Building it first..."
    make -C .. docker-bundle
fi

echo "Starting data-host container..."
docker run --rm -it \
    -p 8080:8080 \
    --name data-host-app \
    data-host:latest
