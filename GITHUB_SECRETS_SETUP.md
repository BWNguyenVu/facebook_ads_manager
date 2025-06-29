# 🔐 GitHub Repository Secrets Setup Guide

## 📋 Danh Sách Secrets Cần Thiết

### 🚀 Deploy Secrets (Bắt buộc)
```
SSH_HOST=your-server-ip-address
SSH_USER=your-ssh-username  
SSH_PRIVATE_KEY=your-ssh-private-key-or-password
DOCKER_USERNAME=your-dockerhub-username
DOCKER_PASSWORD=your-dockerhub-password-or-token
```

### 🔧 Application Secrets (Bắt buộc)
```
MONGODB_URI=mongodb://your-mongodb-host:27017/facebook_ads_manager
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
NEXTAUTH_SECRET=your-nextauth-secret-key-minimum-32-characters
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
```

### 📱 Facebook API Secrets (Tùy chọn)
```
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

## 🛠️ Cách Thêm Secrets vào GitHub

### Bước 1: Truy cập Repository Settings
1. Vào GitHub repository của bạn
2. Click vào tab **Settings**
3. Trong sidebar bên trái, click **Secrets and variables** → **Actions**

### Bước 2: Thêm Repository Secrets
1. Click **New repository secret**
2. Nhập **Name** (tên secret) và **Secret** (giá trị)
3. Click **Add secret**
4. Lặp lại cho tất cả secrets cần thiết

## 🔑 Tạo Strong Secrets

### JWT Secret và NextAuth Secret
```bash
# Tạo random 32-character string
openssl rand -base64 32

# Hoặc sử dụng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### SSH Private Key
```bash
# Tạo SSH key pair mới (nếu chưa có)
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Copy private key content (toàn bộ file, bao gồm -----BEGIN và -----END)
cat ~/.ssh/id_rsa
```

## 📊 Kiểm Tra Secrets

### Trong GitHub Actions Log
- Secrets sẽ hiển thị dưới dạng `***` trong logs
- Không bao giờ log ra giá trị thực của secrets

### Health Check
```bash
# Sau khi deploy, kiểm tra application
curl https://your-domain.com/api/health
```

## 🔒 Best Practices

### Security
- ✅ Sử dụng secrets cho tất cả thông tin nhạy cảm
- ✅ Không commit secrets vào code
- ✅ Thường xuyên rotate secrets
- ✅ Sử dụng minimum permissions

### Environment Separation
- ✅ Dev: Sử dụng `.env.local`
- ✅ Production: Sử dụng GitHub Secrets
- ✅ Staging: Tạo branch riêng với secrets khác

## 🚨 Troubleshooting

### Container không khởi động
```bash
# Kiểm tra logs
docker logs facebook-ads-manager-container

# Kiểm tra environment variables
docker exec facebook-ads-manager-container env | grep -E "(MONGODB|JWT|NEXTAUTH)"
```

### Database connection failed
- Kiểm tra `MONGODB_URI` format: `mongodb://host:port/database`
- Đảm bảo MongoDB server accessible từ container
- Kiểm tra firewall và network settings

### JWT/Auth errors
- Đảm bảo `JWT_SECRET` và `NEXTAUTH_SECRET` có ít nhất 32 ký tự
- Kiểm tra `NEXTAUTH_URL` khớp với domain thực tế

## 📝 Example Secrets Values

### Development (Local)
```bash
MONGODB_URI=mongodb://localhost:27017/facebook_ads_manager
JWT_SECRET=dev-jwt-secret-minimum-32-characters-long
NEXTAUTH_SECRET=dev-nextauth-secret-minimum-32-chars
NEXT_PUBLIC_APP_URL=http://localhost:3089
NEXTAUTH_URL=http://localhost:3089
```

### Production (GitHub Secrets)
```bash
MONGODB_URI=mongodb://your-production-db:27017/facebook_ads_manager
JWT_SECRET=prod-super-secret-jwt-key-with-64-random-characters-for-security
NEXTAUTH_SECRET=prod-nextauth-secret-with-64-random-characters-for-security
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
```

## ✅ Verification Checklist

- [ ] All secrets added to GitHub Repository
- [ ] Secrets không có trailing spaces
- [ ] JWT_SECRET và NEXTAUTH_SECRET có ít nhất 32 ký tự
- [ ] MONGODB_URI có đúng format
- [ ] URLs có protocol (http/https)
- [ ] SSH key có quyền truy cập server
- [ ] Docker Hub credentials hợp lệ
- [ ] MongoDB server accessible
- [ ] Firewall cho phép port 3089

Sau khi setup xong, push code lên GitHub sẽ tự động trigger deployment!
