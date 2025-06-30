# 📋 Logging System Documentation

## 🎯 Overview

Facebook Ads Manager sử dụng hệ thống logging chuyên nghiệp với Winston để thay thế `console.log`. Logs được lưu vào file trong production và hiển thị trong Docker logs.

## 🏗️ Architecture

### Log Levels
- **ERROR**: Lỗi nghiêm trọng cần xử lý ngay
- **WARN**: Cảnh báo, có thể gây vấn đề
- **INFO**: Thông tin quan trọng về hoạt động hệ thống
- **HTTP**: Log các HTTP requests/responses
- **DEBUG**: Chi tiết để debug (chỉ hiển thị trong development)

### Log Files (Production)
```
/app/logs/
├── error.log      # Chỉ errors (max 10MB, 5 files)
├── combined.log   # Tất cả logs (max 10MB, 5 files)
└── app.log        # Info+ logs (max 10MB, 5 files)
```

### Console Output
- **Development**: Colored console output với timestamp
- **Production**: JSON format cho Docker logs

## 🔧 Usage

### Basic Logging
```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger('ComponentName');

logger.error('Something went wrong', error);
logger.warn('This might be a problem');
logger.info('Important information');
logger.debug('Debug details');
```

### Specialized Methods
```typescript
// API requests
logger.apiRequest('POST', '/api/users', userId);
logger.apiResponse('POST', '/api/users', 200, 150);

// Database operations
logger.dbOperation('UPDATE', 'users', { userId, fields: ['email'] });

// User actions
logger.userAction(userId, 'login', { ip: '192.168.1.1' });

// Security events
logger.securityEvent('failed_login', userId, { attempts: 3 });

// Performance monitoring
logger.performance('database_query', 1200, { query: 'SELECT * FROM users' });
```

### Performance Monitoring
```typescript
import { measureTime } from '@/lib/logger';

const result = await measureTime(
  'database_save_user',
  () => userService.save(userData),
  logger
);
```

## 🐳 Docker Integration

### View Logs
```bash
# Live logs
docker logs -f facebook-ads-manager-container

# Last 100 lines
docker logs --tail=100 facebook-ads-manager-container

# Search logs
docker logs facebook-ads-manager-container | grep "error"
```

### Log Scripts
```bash
# Linux/Mac
./scripts/view-logs.sh

# Windows PowerShell
.\scripts\view-logs.ps1
```

## 📁 Log File Access

### Local Development
Logs xuất hiện trực tiếp trong console với màu sắc.

### Docker Compose
```yaml
volumes:
  - ./logs:/app/logs  # Logs accessible in ./logs directory
```

### Production Deployment
```bash
# Mount logs directory
-v /var/log/facebook-ads-manager:/app/logs
```

## 🔍 Log Viewing Tools

### Interactive Log Viewer (Linux/Mac)
```bash
chmod +x scripts/view-logs.sh
./scripts/view-logs.sh
```

Features:
- View live Docker logs
- View specific log files
- Search logs with grep
- Follow live logs
- Clear logs

### PowerShell Log Viewer (Windows)
```powershell
.\scripts\view-logs.ps1
```

Features:
- View Docker logs
- Container status monitoring
- Log search functionality
- Container restart

## 🚨 Error Tracking

### Error Log Structure
```json
{
  "timestamp": "2025-06-30 14:30:15",
  "level": "error",
  "message": "[MongoDB] Connection failed",
  "error": "Connection timeout",
  "stack": "Error: Connection timeout\n    at ...",
  "meta": {
    "userId": "12345",
    "operation": "save_credentials"
  }
}
```

### Critical Error Monitoring
Errors được log với đầy đủ stack trace và context để debug dễ dàng.

## 📊 Performance Monitoring

### Slow Operation Detection
Operations > 1000ms được tự động log như warnings:
```
WARN [API] Slow operation: save_credentials took 1500ms
```

### Database Performance
Tất cả database operations được tracked:
```
DEBUG [MongoDB] DB UPDATE on users { userId: "123", updates: ["email"] }
DEBUG [MongoDB] UPDATE_RESULT users { matchedCount: 1, modifiedCount: 1 }
```

## 🔐 Security Logging

### Authentication Events
```typescript
logger.securityEvent('login_success', userId);
logger.securityEvent('login_failed', null, { ip, email });
logger.securityEvent('token_refresh', userId);
```

### Sensitive Data Protection
- Passwords, tokens không bao giờ được log
- User IDs được log để tracking
- IP addresses được log cho security

## 🛠️ Configuration

### Environment Variables
```bash
NODE_ENV=production    # Controls log level and format
LOG_LEVEL=info        # Override default log level
```

### Log Rotation
- Max file size: 10MB
- Max files kept: 5
- Automatic rotation khi đạt limit

## 📈 Monitoring & Alerts

### Production Monitoring
1. Monitor error.log cho critical errors
2. Set up alerts cho error frequency
3. Track performance logs cho slow operations
4. Monitor disk space cho log files

### Health Check Integration
Health check endpoint (`/api/health`) includes logging status.

## 🔄 Migration from Console.log

### Automatic Replacement
Script `scripts/replace-console-logs.js` đã thay thế:
- `console.log()` → `logger.debug()`
- `console.error()` → `logger.error()`
- `console.warn()` → `logger.warn()`
- `console.info()` → `logger.info()`

### Manual Updates Needed
- Add context-specific logger instances
- Use specialized logging methods
- Add error handling context
- Performance measurement wrapping

## 🚀 Best Practices

1. **Use context-specific loggers**: `createLogger('ComponentName')`
2. **Include relevant metadata**: User IDs, operation details
3. **Log errors with context**: Stack traces + operation context
4. **Monitor performance**: Use `measureTime()` for critical operations
5. **Security-conscious**: Never log sensitive data
6. **Structured logging**: Use JSON format in production
7. **Log rotation**: Let Winston handle file rotation
8. **Docker-friendly**: Logs visible in `docker logs`

## 🔧 Troubleshooting

### Logs Not Appearing
1. Check container is running
2. Verify volume mounts
3. Check file permissions
4. Ensure NODE_ENV is set correctly

### Performance Issues
1. Monitor log file sizes
2. Adjust log levels if too verbose
3. Check disk space
4. Consider log shipping for high volume

### Debug Mode
Set `NODE_ENV=development` để enable debug logs và colored console output.
