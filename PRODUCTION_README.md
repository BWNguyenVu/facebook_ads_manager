# Facebook Ads Manager - Production Deployment

## 📋 Prerequisites

- Docker installed on your server
- MongoDB instance running
- Domain name and SSL certificate (recommended)
- Minimum 2GB RAM, 1 CPU core

## 🚀 Quick Deploy with GitHub Actions (Recommended)

### 1. Setup GitHub Repository Secrets
📖 **See detailed guide: [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)**

Required secrets:
- `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY` (Server access)
- `DOCKER_USERNAME`, `DOCKER_PASSWORD` (Docker Hub)
- `MONGODB_URI`, `JWT_SECRET`, `NEXTAUTH_SECRET` (Application)
- `NEXT_PUBLIC_APP_URL`, `NEXTAUTH_URL` (URLs)
- `FACEBOOK_APP_ID`, `FACEBOOK_APP_SECRET` (Optional)

### 2. Push to Deploy
```bash
git push origin main
# GitHub Actions will automatically build and deploy!
```

## 🐳 Manual Deploy with Docker

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd facebook-ads-manager/app
```

### 2. Configure Environment (For Local/Manual Deploy Only)
```bash
cp .env.example .env.local
# Edit .env.local with your actual values
nano .env.local
```

### 3. Build and Run
```bash
# Using Docker Compose (uses environment variables)
export MONGODB_URI="mongodb://your-host:27017/facebook_ads_manager"
export JWT_SECRET="your-super-secret-jwt-key-minimum-32-chars"
export NEXTAUTH_SECRET="your-nextauth-secret-minimum-32-chars"
export NEXT_PUBLIC_APP_URL="https://your-domain.com"
export NEXTAUTH_URL="https://your-domain.com"

docker-compose up -d

# Or using Docker directly
docker build -t facebook-ads-manager .
docker run -d -p 3089:3089 \
  -e MONGODB_URI="mongodb://your-host:27017/facebook_ads_manager" \
  -e JWT_SECRET="your-jwt-secret" \
  -e NEXTAUTH_SECRET="your-nextauth-secret" \
  -e NEXT_PUBLIC_APP_URL="https://your-domain.com" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  --name facebook-ads-manager \
  facebook-ads-manager
```

## 🌐 Production Setup

### 1. Environment Variables
Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Strong secret for JWT tokens (min 32 characters)
- `NODE_ENV=production`

### 2. Reverse Proxy Setup (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3089;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. SSL Setup (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 🔧 GitHub Actions Deployment (Recommended)

The project uses GitHub Actions for automated deployment with Repository Secrets for security.

### Required GitHub Repository Secrets:

#### Server Access
- `SSH_HOST`: Your server IP address
- `SSH_USER`: SSH username  
- `SSH_PRIVATE_KEY`: SSH private key content

#### Docker Hub
- `DOCKER_USERNAME`: Your Docker Hub username
- `DOCKER_PASSWORD`: Your Docker Hub password/token

#### Application Configuration
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Strong secret for JWT tokens (min 32 characters)
- `NEXTAUTH_SECRET`: NextAuth secret (min 32 characters)
- `NEXT_PUBLIC_APP_URL`: Your application URL
- `NEXTAUTH_URL`: Your application URL (same as above)

#### Optional Facebook API
- `FACEBOOK_APP_ID`: Your Facebook App ID
- `FACEBOOK_APP_SECRET`: Your Facebook App Secret

📖 **Detailed setup guide: [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md)**

### Deployment Process:
1. Push code to `main` branch
2. GitHub Actions automatically builds Docker image
3. Pushes image to Docker Hub
4. Deploys to your VPS with secrets as environment variables
5. Application starts with all secrets securely injected

## 📊 Monitoring

### Health Check
```bash
# Check if container is running
docker ps | grep facebook-ads-manager

# Check logs
docker logs facebook-ads-manager-container

# Check application health
curl http://localhost:3089/api/health
```

### Resource Monitoring
```bash
# Monitor container resources
docker stats facebook-ads-manager-container
```

## 🔐 Security Recommendations

1. **Use strong JWT secrets** (minimum 32 characters)
2. **Enable MongoDB authentication**
3. **Use HTTPS in production**
4. **Regularly update dependencies**
5. **Monitor logs for suspicious activity**
6. **Backup your database regularly**

## 🛠️ Maintenance

### Update Application
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up -d --build

# Or using GitHub Actions (automatic)
git push origin main
```

### Database Backup
```bash
# Create backup
docker exec mongodb mongodump --db facebook_ads_manager --out /backup

# Restore backup
docker exec mongodb mongorestore --db facebook_ads_manager /backup/facebook_ads_manager
```

## 📞 Support

For issues and questions:
1. Check the logs: `docker logs facebook-ads-manager-container`
2. Verify environment variables
3. Ensure MongoDB is accessible
4. Check firewall and port settings

## 🎯 Features

- ✅ Facebook Ads campaign management
- ✅ CSV upload and processing
- ✅ Real-time campaign monitoring
- ✅ User authentication and session management
- ✅ Comprehensive documentation in Vietnamese
- ✅ Modern responsive UI
- ✅ Docker containerization
- ✅ Auto-deployment with GitHub Actions
