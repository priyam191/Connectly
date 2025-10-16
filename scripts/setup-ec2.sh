#!/bin/bash
# EC2 Server Setup Script for Connectly
# Run this script on your EC2 instance

set -e

echo "🚀 Setting up Connectly on AWS EC2..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "🐳 Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker ubuntu
    rm get-docker.sh
    echo "✅ Docker installed successfully"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "🔧 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose installed successfully"
else
    echo "✅ Docker Compose already installed"
fi

# Install Node.js (for npm scripts)
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    echo "✅ Node.js installed successfully"
else
    echo "✅ Node.js already installed"
fi

# Install Git
echo "📦 Installing Git..."
if ! command -v git &> /dev/null; then
    sudo apt install git -y
    echo "✅ Git installed successfully"
else
    echo "✅ Git already installed"
fi

# Install Nginx (for reverse proxy)
echo "🌐 Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install nginx -y
    sudo systemctl enable nginx
    echo "✅ Nginx installed successfully"
else
    echo "✅ Nginx already installed"
fi

# Create application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /var/www/connectly
sudo chown ubuntu:ubuntu /var/www/connectly

# Create production data directories
echo "📁 Creating production data directories..."
sudo mkdir -p /var/lib/connectly/{mongodb,uploads,mongodb-config}
sudo chown -R ubuntu:ubuntu /var/lib/connectly

# Clone repository
echo "📥 Cloning Connectly repository..."
cd /var/www/connectly
if [ ! -d ".git" ]; then
    echo "Please clone your repository manually:"
    echo "cd /var/www/connectly"
    echo "git clone https://github.com/priyam191/Connectly.git ."
    echo ""
    echo "Then run the following commands:"
    echo "chmod +x scripts/setup-nginx.sh"
    echo "./scripts/setup-nginx.sh"
else
    echo "✅ Repository already cloned"
fi

# Add ubuntu user to docker group (requires logout/login to take effect)
echo "👤 Adding user to docker group..."
sudo usermod -aG docker ubuntu

echo ""
echo "🎉 EC2 setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Logout and login again (or run: newgrp docker)"
echo "2. Clone your repository if not done already"
echo "3. Configure environment variables"
echo "4. Start the application with Docker Compose"
echo ""
echo "Commands to run after logout/login:"
echo "cd /var/www/connectly"
echo "git clone https://github.com/priyam191/Connectly.git . # if not cloned"
echo "docker-compose up -d"