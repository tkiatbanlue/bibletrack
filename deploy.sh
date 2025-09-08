#!/bin/bash
# Deploy to Surge.sh

# Build the project
echo "Building the project..."
npm run build

# Rename index.html to 200.html to handle client-side routing
echo "Renaming index.html to 200.html for Surge..."
mv build/index.html build/200.html

# Deploy to Surge.sh
echo "Deploying to Surge.sh..."
surge build bibletrack.surge.sh