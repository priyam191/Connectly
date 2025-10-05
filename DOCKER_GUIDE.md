# Docker & GitHub Actions Setup Guide

This guide explains how to run your Connectly application using Docker and deploy it with GitHub Actions.

## 🚀 Quick Start

### Development Environment

1. **Clone and setup:**
   ```bash
   git clone <your-repo-url>
   cd connectly
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Run with Docker (Development):**
   ```bash
   npm run dev
   # Or manually:
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Production Environment

1. **Build and run production:**
   ```bash
   npm run build
   npm start
   # Or manually:
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   npm run logs
   ```

3. **Stop services:**
   ```bash
   npm run stop
   ```

## 📋 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development environment with hot reload |
| `npm run dev:down` | Stop development environment |
| `npm start` | Start production environment |
| `npm run stop` | Stop all services |
| `npm run build` | Build Docker images |
| `npm run logs` | View service logs |
| `npm run clean` | Clean up Docker resources |
| `npm run install:all` | Install dependencies for both client and server |

## 🐳 Docker Architecture

### Services

- **MongoDB**: Database service with persistent storage
- **Server**: Node.js Express API backend
- **Client**: Next.js React frontend

### Network

All services communicate through a custom Docker network (`connectly-network`).

### Volumes

- `mongodb_data`: Persistent database storage
- `server_uploads`: File uploads storage
- `mongodb_config`: MongoDB configuration

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your-secure-password
MONGO_DB_NAME=connectly

# Application
NODE_ENV=production
SERVER_PORT=5000
CLIENT_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Security Notes

- Change default MongoDB credentials in production
- Use strong passwords
- Consider using Docker secrets for sensitive data

## 🔄 GitHub Actions CI/CD

### Workflow Overview

The GitHub Actions workflow (`ci-cd.yml`) includes:

1. **Testing**: Runs tests on Node.js 18.x and 20.x
2. **Security Scanning**: Trivy vulnerability scanner for PRs
3. **Building**: Multi-stage Docker builds with caching
4. **Deployment**: Automated deployment to staging/production

### Setup Required

1. **Enable GitHub Container Registry:**
   - Go to repository Settings → Actions → General
   - Enable "Read and write permissions" for GITHUB_TOKEN

2. **Branch Configuration:**
   - `main` branch: Production deployment
   - `develop` branch: Staging deployment

### Docker Images

Images are automatically published to GitHub Container Registry:
- `ghcr.io/your-username/connectly-server`
- `ghcr.io/your-username/connectly-client`

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Option 2: Individual Services

```bash
# Build images
docker build -t connectly-server ./server
docker build -t connectly-client ./client

# Run with custom network
docker network create connectly-network
docker run -d --name mongodb --network connectly-network mongo:7.0
docker run -d --name server --network connectly-network -p 5000:5000 connectly-server
docker run -d --name client --network connectly-network -p 3000:3000 connectly-client
```

### Option 3: Kubernetes (Advanced)

For Kubernetes deployment, you'll need to create:
- Deployment manifests
- Service manifests
- ConfigMaps/Secrets
- Persistent Volume Claims

## 🔧 Health Checks

### Endpoints

- Server health: `GET /health`
- Client health: `GET /api/health`

### Docker Health Checks

All services include health checks:
- MongoDB: Database ping test
- Server: HTTP health endpoint check
- Client: Next.js health endpoint check

## 📊 Monitoring & Logging

### Production Logging

- Log rotation: 10MB max, 3 files retained
- JSON format for structured logging
- Centralized through Docker logging driver

### Resource Limits

- Server: 512MB limit, 256MB reservation
- Client: 256MB limit, 128MB reservation
- MongoDB: No limits (adjust based on your needs)

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using port 3000/5000
   netstat -ano | findstr :3000
   netstat -ano | findstr :5000
   ```

2. **MongoDB connection issues:**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   ```

3. **Build failures:**
   ```bash
   # Clean rebuild
   npm run clean
   npm run build
   ```

4. **Permission issues (Linux/Mac):**
   ```bash
   # Fix volume permissions
   sudo chown -R $USER:$USER /var/lib/connectly
   ```

### Debug Commands

```bash
# View service status
docker-compose ps

# Enter a running container
docker-compose exec server sh
docker-compose exec client sh

# View real-time logs
docker-compose logs -f [service-name]

# Restart a specific service
docker-compose restart server
```

## 🔄 Updates & Maintenance

### Updating the Application

1. **Development:**
   ```bash
   git pull origin main
   npm run dev:down
   npm run dev
   ```

2. **Production:**
   ```bash
   git pull origin main
   npm run stop
   npm run build
   npm start
   ```

### Database Backup

```bash
# Create backup
docker-compose exec mongodb mongodump --out /backup

# Restore backup
docker-compose exec mongodb mongorestore /backup
```

## 📈 Performance Optimization

### Docker Optimization

- Multi-stage builds reduce image sizes
- `.dockerignore` files exclude unnecessary files
- Layer caching improves build speed
- Health checks ensure service reliability

### Next.js Optimization

- Standalone output reduces deployment size
- Static file optimization
- Image optimization enabled by default

## 🔒 Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use secrets management in production
   - Rotate credentials regularly

2. **Docker Security:**
   - Run as non-root user
   - Use official base images
   - Regular security scans
   - Network isolation

3. **Application Security:**
   - CORS configuration
   - Input validation
   - Authentication/authorization
   - HTTPS in production

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [MongoDB Docker Guide](https://hub.docker.com/_/mongo)

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Docker/application logs
3. Check GitHub Issues
4. Consult the documentation links