#!/bin/bash

# GitHub Secrets Generator Script
# Usage: ./generate-secrets.sh

echo "🔐 GitHub Repository Secrets Generator"
echo "======================================"
echo ""

echo "📝 Copy these values to your GitHub Repository Secrets:"
echo ""

echo "# Application Secrets"
echo "JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')"
echo "NEXTAUTH_SECRET=$(openssl rand -base64 48 | tr -d '\n')"
echo ""

echo "# Example MongoDB URI (Update with your actual values)"
echo "MONGODB_URI=mongodb://your-mongodb-host:27017/facebook_ads_manager"
echo ""

echo "# Example URLs (Update with your actual domain)"
echo "NEXT_PUBLIC_APP_URL=https://your-domain.com"
echo "NEXTAUTH_URL=https://your-domain.com"
echo ""

echo "# Server Access (Update with your actual values)"
echo "SSH_HOST=your-server-ip"
echo "SSH_USER=your-ssh-username"
echo "SSH_PRIVATE_KEY=your-ssh-private-key-content"
echo ""

echo "# Docker Hub (Update with your actual credentials)"
echo "DOCKER_USERNAME=your-dockerhub-username"
echo "DOCKER_PASSWORD=your-dockerhub-password"
echo ""

echo "# Optional Facebook API (Update with your actual values)"
echo "FACEBOOK_APP_ID=your-facebook-app-id"
echo "FACEBOOK_APP_SECRET=your-facebook-app-secret"
echo ""

echo "✅ Strong secrets generated!"
echo "📖 See GITHUB_SECRETS_SETUP.md for detailed setup instructions"
