#!/bin/bash
# Deployment script for Bible Reading Checklist

echo "=== Bible Reading Checklist Deployment ==="
echo "This script will deploy your app to Surge.sh"
echo ""

# Build the project
echo "1. Building the project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
echo "✅ Build completed successfully"
echo ""

# Deploy to Surge.sh
echo "2. Deploying to Surge.sh..."
echo "   You will be prompted to enter your email and password"
echo "   Email: tkiatbanlue@gmail.com"
echo "   Please enter your Surge.sh credentials when prompted"
echo ""

# Deploy with a static domain
DOMAIN="bibletrack.surge.sh"
echo "   Deploying to: $DOMAIN"
echo ""

surge build $DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment completed successfully!"
    echo "   Your app is now live at: $DOMAIN"
    echo ""
    echo "📝 Deployment Details:" > deployment.log
    echo "Date: $(date)" >> deployment.log
    echo "Domain: $DOMAIN" >> deployment.log
    echo "Status: Success" >> deployment.log
    echo "" >> deployment.log
    echo "Deployment log saved to deployment.log"
else
    echo ""
    echo "❌ Deployment failed. Please check the errors above."
    echo ""
    echo "📝 Deployment Details:" > deployment.log
    echo "Date: $(date)" >> deployment.log
    echo "Domain: $DOMAIN" >> deployment.log
    echo "Status: Failed" >> deployment.log
    echo "Error: Deployment failed" >> deployment.log
    echo "" >> deployment.log
    echo "Deployment log saved to deployment.log"
fi