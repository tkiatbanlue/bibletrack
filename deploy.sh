#!/bin/bash
# Deploy to Surge.sh

# Build the project
echo "Building the project..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Rename index.html to 200.html to handle client-side routing
echo "Renaming index.html to 200.html for Surge..."
mv build/index.html build/200.html

# Deploy to Surge.sh with a unique domain name
DOMAIN="bibletrack-$(date +%Y%m%d%H%M%S).surge.sh"
echo "Deploying to Surge.sh on domain: $DOMAIN"
surge build $DOMAIN