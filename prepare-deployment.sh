#!/bin/bash
# Preparation script for BibleTrack application deployment

echo "🚀 Preparing BibleTrack application for deployment..."

# 1. Build the React application
echo "🔨 Building React application..."
cd /home/admin/bibletrack
npm run build

# 2. Copy build files to a temporary location
echo "📦 Copying build files to /tmp/bibletrack/..."
mkdir -p /tmp/bibletrack
cp -r /home/admin/bibletrack/build/* /tmp/bibletrack/

echo "✅ Build files prepared in /tmp/bibletrack/"

# 3. Create .htaccess for React Router
echo "🔧 Creating .htaccess for React Router..."
cat > /tmp/bibletrack/.htaccess <<'EOF'
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
EOF

echo "✅ .htaccess file created"

echo ""
echo "📋 NEXT STEPS - Run these commands as root (sudo):"
echo "=================================================="
echo "1. Copy files to web directory:"
echo "   sudo mkdir -p /var/www/html/bibletrack"
echo "   sudo cp -r /tmp/bibletrack/* /var/www/html/bibletrack/"
echo "   sudo chown -R www-data:www-data /var/www/html/bibletrack"
echo ""
echo "2. Enable Apache modules (if not already enabled):"
echo "   sudo a2enmod rewrite"
echo ""
echo "3. Update Apache configuration to allow .htaccess:"
echo "   Edit /etc/apache2/apache2.conf and ensure the <Directory /var/www/html> section has:"
echo "   AllowOverride All"
echo ""
echo "4. Restart Apache:"
echo "   sudo systemctl reload apache2"
echo ""
echo "5. Access your application at:"
echo "   http://100.89.155.48/bibletrack"
echo ""
echo "📝 TROUBLESHOOTING:"
echo "- If pages return 404, check that AllowOverride is set to 'All'"
echo "- If routing doesn't work, ensure mod_rewrite is enabled"
echo "- Check Apache error logs: sudo tail -f /var/log/apache2/error.log"