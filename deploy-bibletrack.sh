#!/bin/bash
# Deployment script for BibleTrack application

echo "🚀 Deploying BibleTrack application..."

# 1. Build the React application
echo "🔨 Building React application..."
cd /home/admin/bibletrack
npm run build

# 2. Copy build files to deployment directory
echo "📦 Copying build files..."
mkdir -p /tmp/bibletrack
cp -r /home/admin/bibletrack/build/* /tmp/bibletrack/

echo "✅ Build files copied to /tmp/bibletrack/"

# 3. Instructions for deployment
echo ""
echo "📋 DEPLOYMENT INSTRUCTIONS:"
echo "=========================="
echo "1. Copy the Apache configuration file to sites-available:"
echo "   sudo cp /home/admin/bibletrack/bibletrack-apache-config.txt /etc/apache2/sites-available/bibletrack.conf"
echo ""
echo "2. Enable the site:"
echo "   sudo a2ensite bibletrack.conf"
echo ""
echo "3. Enable required Apache modules:"
echo "   sudo a2enmod rewrite headers"
echo ""
echo "4. Copy the build files to the web directory:"
echo "   sudo mkdir -p /var/www/bibletrack"
echo "   sudo cp -r /tmp/bibletrack/* /var/www/bibletrack/"
echo "   sudo chown -R www-data:www-data /var/www/bibletrack"
echo ""
echo "5. Restart Apache:"
echo "   sudo systemctl reload apache2"
echo ""
echo "6. Access your application at: http://your-server-ip/"
echo ""
echo "📝 NOTE: Replace 'your-server-ip' with your actual server IP address"
echo "   Your server IP addresses are:"
hostname -I | sed 's/^/   - /'
echo ""
echo "🔧 TROUBLESHOOTING:"
echo "   - If you get permission errors, check that www-data has read access to /var/www/bibletrack"
echo "   - If routing doesn't work, ensure mod_rewrite is enabled"
echo "   - Check Apache error logs: sudo tail -f /var/log/apache2/bibletrack_error.log"