# GitHub Secrets Generator Script for Windows
# Usage: .\generate-secrets.ps1

Write-Host "🔐 GitHub Repository Secrets Generator" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 Copy these values to your GitHub Repository Secrets:" -ForegroundColor Yellow
Write-Host ""

# Generate strong secrets
$jwtSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$nextAuthSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(48))

Write-Host "# Application Secrets" -ForegroundColor Green
Write-Host "JWT_SECRET=$jwtSecret"
Write-Host "NEXTAUTH_SECRET=$nextAuthSecret"
Write-Host ""

Write-Host "# Example MongoDB URI (Update with your actual values)" -ForegroundColor Green
Write-Host "MONGODB_URI=mongodb://your-mongodb-host:27017/facebook_ads_manager"
Write-Host ""

Write-Host "# Example URLs (Update with your actual domain)" -ForegroundColor Green
Write-Host "NEXT_PUBLIC_APP_URL=https://your-domain.com"
Write-Host "NEXTAUTH_URL=https://your-domain.com"
Write-Host ""

Write-Host "# Server Access (Update with your actual values)" -ForegroundColor Green
Write-Host "SSH_HOST=your-server-ip"
Write-Host "SSH_USER=your-ssh-username"
Write-Host "SSH_PRIVATE_KEY=your-ssh-private-key-content"
Write-Host ""

Write-Host "# Docker Hub (Update with your actual credentials)" -ForegroundColor Green
Write-Host "DOCKER_USERNAME=your-dockerhub-username"
Write-Host "DOCKER_PASSWORD=your-dockerhub-password"
Write-Host ""

Write-Host "# Optional Facebook API (Update with your actual values)" -ForegroundColor Green
Write-Host "FACEBOOK_APP_ID=your-facebook-app-id"
Write-Host "FACEBOOK_APP_SECRET=your-facebook-app-secret"
Write-Host ""

Write-Host "✅ Strong secrets generated!" -ForegroundColor Green
Write-Host "📖 See GITHUB_SECRETS_SETUP.md for detailed setup instructions" -ForegroundColor Blue
