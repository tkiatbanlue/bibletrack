#!/bin/bash
# Simple deployment script for BibleTrack application to /bibletrack subdirectory

echo "🚀 Deploying BibleTrack application to /bibletrack subdirectory..."

# 1. Build the React application
echo "🔨 Building React application..."
cd /home/admin/bibletrack
npm run build

# 2. Copy build files to Apache document root subdirectory
echo "📦 Copying build files to /var/www/html/bibletrack/..."
sudo mkdir -p /var/www/html/bibletrack
sudo cp -r /home/admin/bibletrack/build/* /var/www/html/bibletrack/
sudo chown -R www-data:www-data /var/www/html/bibletrack

echo "✅ BibleTrack deployed to /var/www/html/bibletrack/"

# 3. Update Apache configuration for React Router
echo "🔧 Creating .htaccess for React Router..."
sudo tee /var/www/html/bibletrack/.htaccess > /dev/null <<'EOF'
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
EOF

sudo chown www-data:www-data /var/www/html/bibletrack/.htaccess

echo "✅ .htaccess file created for React Router"

# 4. Restart Apache
echo "🔄 Restarting Apache..."
sudo systemctl reload apache2

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================"
echo "Your BibleTrack application is now accessible at:"
echo "   http://your-server-ip/bibletrack"
echo ""
echo "Your server IP addresses are:"
hostname -I | sed 's/^/   - /'
echo ""
echo "For example:"
echo "   http://100.89.155.48/bibletrack"
echo ""
echo "📝 NOTES:"
echo "1. Make sure mod_rewrite is enabled: sudo a2enmod rewrite"
echo "2. If you get 404 errors, check that AllowOverride is set to 'All' in your Apache config"
echo "3. Progress saving will work correctly with proper authentication"