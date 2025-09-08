#!/bin/bash
# Simple deploy script for Surge.sh

# Build the project
npm run build

# Deploy to Surge.sh with a custom domain
surge build bibletrack-$(date +%s).surge.sh