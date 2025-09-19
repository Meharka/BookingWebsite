#!/bin/bash

set -e

echo "Importing hotel data into FlyNext..."

docker compose exec app node import-hotels.js

echo "Hotel data import completed successfully!"
