# Complete AWS EC2 Deployment Guide

## 🎯 **Deployment Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   GitHub Repo   │───▶│  GitHub Actions  │───▶│   AWS EC2       │
│   (Your Code)   │    │   (CI/CD)        │    │   (Production)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                │                 │
                                                │  ┌─────────────┐│
                                                │  │  Next.js    ││
                                                │  │  (Port 3000)││
                                                │  └─────────────┘│
                                                │  ┌─────────────┐│
                                                │  │  Node.js    ││
                                                │  │  (Port 5000)││
                                                │  └─────────────┘│
                                                │  ┌─────────────┐│
                                                │  │  MongoDB    ││
                                                │  │  (Port 27017)│
                                                │  └─────────────┘│
                                                └─────────────────┘
```

## 📋 **Prerequisites**

### 1. AWS Account Setup
- Active AWS account
- AWS CLI installed locally
- Basic understanding of EC2, Security Groups, and Key Pairs

### 2. Domain & SSL (Optional but Recommended)
- Domain name (for production)
- SSL certificate (Let's Encrypt or AWS Certificate Manager)

## 🛠️ **Step 1: AWS Infrastructure Setup**

### Create EC2 Instance

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.medium (minimum) or t3.large (recommended)
   - Storage: 20-30 GB GP3
   - Security Group: Create new with these rules:

```
Inbound Rules:
- SSH (22): Your IP only
- HTTP (80): 0.0.0.0/0
- HTTPS (443): 0.0.0.0/0
- Custom TCP (3000): 0.0.0.0/0  # Next.js (temporary)
- Custom TCP (5000): 0.0.0.0/0  # Node.js API (temporary)

Outbound Rules:
- All traffic: 0.0.0.0/0
```

2. **Create or Use Existing Key Pair:**
   - Download the .pem file
   - Keep it secure (you'll need it for SSH)

## 🔧 **Step 2: Server Setup Script**

### Connect to Your EC2 Instance
```bash
# Replace with your details
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

### Run Server Setup
```bash
#!/bin/bash
# Save this as setup-server.sh and run on EC2

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.21.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js (for npm scripts)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y

# Create application directory
sudo mkdir -p /var/www/connectly
sudo chown ubuntu:ubuntu /var/www/connectly
cd /var/www/connectly

# Clone your repository (you'll need to do this manually with your repo)
echo "Ready for deployment!"
```

## 🚀 **Step 3: GitHub Actions AWS Deployment**

### Add Secrets to GitHub Repository

1. Go to: `https://github.com/your-username/Connectly/settings/secrets/actions`
2. Add these secrets:

```
AWS_EC2_HOST=your-ec2-public-ip
AWS_EC2_USER=ubuntu
AWS_EC2_KEY=<paste-your-private-key-here>
MONGO_ROOT_PASSWORD=your-secure-mongo-password
JWT_SECRET=your-super-secret-jwt-key
```

## 📦 **Step 4: Environment Configuration for Production**

### Production Environment Variables
Create these on your EC2 instance at `/var/www/connectly/.env.production`:

```env
# Database Configuration
MONGO_URI=mongodb://connectly_admin:${MONGO_ROOT_PASSWORD}@mongodb:27017/connectly?authSource=admin
MONGO_ROOT_USERNAME=connectly_admin
MONGO_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
MONGO_DB_NAME=connectly

# Application Configuration
NODE_ENV=production
SERVER_PORT=5000
CLIENT_PORT=3000

# Public URLs (replace with your domain/IP)
NEXT_PUBLIC_API_URL=https://your-domain.com/api
# or for IP: NEXT_PUBLIC_API_URL=http://your-ec2-ip:5000

# Security
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-domain.com

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/var/lib/connectly/uploads
```

## 🔄 **Step 5: Complete Deployment Process**

### Manual Deployment Steps

1. **Connect to EC2:**
```bash
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

2. **Run setup script:**
```bash
wget https://raw.githubusercontent.com/priyam191/Connectly/main/scripts/setup-ec2.sh
chmod +x setup-ec2.sh
./setup-ec2.sh
```

3. **Logout and login again:**
```bash
exit
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip
```

4. **Clone repository and setup:**
```bash
cd /var/www/connectly
git clone https://github.com/priyam191/Connectly.git .
chmod +x scripts/setup-nginx.sh
./scripts/setup-nginx.sh
```

5. **Create production environment:**
```bash
cp .env.example .env.production
# Edit .env.production with your production values
```

6. **Start the application:**
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d
```

## 🚀 **Step 6: Automated Deployment with GitHub Actions**

Your GitHub Actions workflow is now configured for AWS deployment!

### Required GitHub Secrets
Add these secrets to your GitHub repository at `Settings > Secrets and variables > Actions`:

```
AWS_EC2_HOST=your-ec2-public-ip
AWS_EC2_USER=ubuntu
AWS_EC2_KEY=<paste-your-private-key-content-here>
MONGO_ROOT_PASSWORD=your-secure-mongo-password
JWT_SECRET=your-super-secret-jwt-key
```

### Deployment Flow
1. **Push to main branch** triggers production deployment
2. GitHub Actions builds and tests your code
3. Docker images are created and cached
4. Code is deployed to your EC2 instance
5. Application is restarted with new code

## 🔍 **Step 7: Monitoring and Maintenance**

### Check Application Status
```bash
# Check running containers
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f mongodb
```

### Backup Database
```bash
# Create backup
docker-compose exec mongodb mongodump --out /tmp/backup

# Copy backup to host
docker cp $(docker-compose ps -q mongodb):/tmp/backup ./backup-$(date +%Y%m%d)
```

### Update Application
```bash
# Manual update
cd /var/www/connectly
git pull origin main
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --env-file .env.production up -d --build
```

## 🔒 **Step 8: SSL/HTTPS Setup (Optional)**

### Using Let's Encrypt
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (replace your-domain.com)
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🛠️ **Troubleshooting**

### Common Issues

1. **Port 3000/5000 not accessible:**
   - Check security group rules
   - Verify containers are running: `docker-compose ps`

2. **MongoDB connection issues:**
   - Check MongoDB logs: `docker-compose logs mongodb`
   - Verify environment variables

3. **Build failures:**
   - Check GitHub Actions logs
   - Verify secrets are set correctly

4. **502 Bad Gateway:**
   - Check if containers are running
   - Verify Nginx configuration: `sudo nginx -t`
   - Check application logs

### Log Files
```bash
# Application logs
docker-compose logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx
sudo journalctl -u docker
```

## 📊 **Performance Optimization**

### Server Resources
- **t3.medium**: Good for testing/small traffic
- **t3.large**: Recommended for production
- **t3.xlarge**: High traffic applications

### Docker Optimization
- Enable log rotation in docker-compose.prod.yml
- Use Docker system prune regularly
- Monitor disk space usage

### Monitoring Setup
```bash
# Install htop for system monitoring
sudo apt install htop -y

# Check disk usage
df -h

# Check Docker disk usage
docker system df
```

## 🌐 **DNS and Domain Setup**

### Point Domain to EC2
1. Get your EC2 Elastic IP (recommended)
2. Create A record: `your-domain.com` → `EC2-IP`
3. Update CORS_ORIGIN in environment variables
4. Update NEXT_PUBLIC_API_URL

## 💰 **Cost Optimization**

### AWS Cost Savings
- Use **t3.medium** for development
- Consider **Reserved Instances** for production
- Set up **billing alerts**
- Use **Elastic IP** to avoid changing IPs

### Estimated Monthly Costs
- **t3.medium**: ~$30/month
- **t3.large**: ~$60/month
- **Storage (20GB)**: ~$2/month
- **Data Transfer**: Variable

## ✅ **Deployment Checklist**

### Before Deployment
- [ ] AWS EC2 instance created
- [ ] Security group configured
- [ ] Key pair downloaded
- [ ] Domain pointed to EC2 (optional)
- [ ] GitHub secrets configured

### After Deployment
- [ ] Application accessible via browser
- [ ] API endpoints working
- [ ] Database connected
- [ ] File uploads working
- [ ] SSL certificate installed (optional)
- [ ] Monitoring set up
- [ ] Backup strategy implemented

## 🎆 **Success! Your App is Live**

Once deployed, your Connectly application will be available at:
- **Frontend**: `http://your-ec2-ip/` or `https://your-domain.com/`
- **API**: `http://your-ec2-ip/api/` or `https://your-domain.com/api/`
- **Health Check**: `http://your-ec2-ip/health`

Every push to the `main` branch will automatically deploy to production! 🚀
