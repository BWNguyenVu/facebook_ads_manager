# User Authentication & Account Management Guide

## Tổng quan
Hệ thống đã được nâng cấp với tính năng authentication hoàn chỉnh, quản lý user/account và phân quyền. Bây giờ mỗi user có thể:

- Đăng ký tài khoản với email/password
- Đăng nhập với authentication
- Lấy long-lived access token từ Facebook
- Quản lý nhiều Facebook accounts
- Xem campaign logs theo user/account riêng biệt

## Các tính năng mới

### 1. User Authentication System

**Registration:**
- Email và password được hash bằng bcrypt
- Hỗ trợ tạo user với role admin/user
- Validation email unique

**Login:**
- Email + password validation
- JWT token được tạo với thông tin user
- Session được lưu trong localStorage
- Tự động sync Facebook accounts nếu có access token

### 2. Long-lived Facebook Token

**Token Exchange:**
- Input: Short-lived token từ Facebook Graph API Explorer
- Output: Long-lived token (60 ngày)
- Tự động lưu vào database với user

**Cách lấy Long-lived Token:**
1. Vào `/auth` và chọn tab "Get Token"
2. Nhập short-lived token từ Facebook Graph API Explorer
3. Hệ thống tự động exchange sang long-lived token
4. Token được lưu và sử dụng cho các API calls

### 3. Account Management

**Sync Facebook Accounts:**
- Tự động sync khi login với access token
- Lưu account info: account_id, name, business info
- Hỗ trợ set primary account

**Account Filtering:**
- Campaign logs được filter theo user_id và account_id
- Stats API chỉ trả về data của user hiện tại
- Hỗ trợ multi-account per user

### 4. Database Schema

**Users Collection:**
```typescript
{
  _id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  facebook_user_id?: string;
  long_lived_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  role: 'admin' | 'user';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}
```

**Accounts Collection:**
```typescript
{
  _id: string;
  user_id: string;
  account_id: string;
  account_name: string;
  business_id?: string;
  business_name?: string;
  access_permissions: string[];
  is_primary: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

**Campaign Logs (Updated):**
```typescript
{
  _id: string;
  user_id: string;      // NEW
  account_id: string;   // NEW
  name: string;
  csvRow: any;
  status: 'success' | 'error' | 'pending';
  facebook_ids?: object;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}
```

## API Endpoints mới

### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/exchange-token` - Exchange Facebook token

### User Management
- `GET /api/user/accounts` - Lấy accounts của user hiện tại
- `POST /api/user/accounts` - Thêm account mới
- `PUT /api/user/accounts` - Cập nhật account (set primary)

### Updated APIs
- `GET /api/mongodb/logs?account_id=xxx` - Logs theo account
- `GET /api/mongodb/stats?account_id=xxx` - Stats theo account
- Tất cả APIs đều yêu cầu JWT token trong header

## UI Changes

### `/auth` page (mới)
- Tab "Login": Email + password + optional access token
- Tab "Register": Đăng ký user mới
- Tab "Get Token": Exchange Facebook token

### `/dashboard` page (updated)
- Hiển thị user email và account name
- Stats được filter theo user/account
- Campaign logs chỉ của user hiện tại
- Cảnh báo nếu thiếu token hoặc account

### Authorization Headers
Tất cả API calls đều cần:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Migration từ hệ thống cũ

**Step 1: Tạo user admin**
```javascript
// Đăng ký user đầu tiên qua /auth
{
  email: "admin@example.com",
  password: "your-password",
  full_name: "Admin User"
}
```

**Step 2: Login và exchange token**
1. Login với email/password
2. Vào tab "Get Token" để exchange Facebook token
3. Hệ thống tự động sync Facebook accounts

**Step 3: Migrate existing campaign logs**
Nếu có logs cũ, cần add user_id và account_id:
```javascript
// Script migration (run once)
db.campaign_logs.updateMany(
  { user_id: { $exists: false } },
  { 
    $set: { 
      user_id: "your-user-id",
      account_id: "your-account-id"
    }
  }
)
```

## Environment Variables cần thiết

```bash
# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=facebook_ads_manager

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Facebook App (for token exchange)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
```

## Security Features

1. **Password Hashing**: bcrypt với salt rounds 12
2. **JWT Authentication**: 7 ngày expiry, secure secret
3. **Authorization**: Tất cả API protected với JWT
4. **Data Isolation**: Users chỉ thấy data của mình
5. **Token Security**: Facebook tokens được encrypt trong DB

## Troubleshooting

**Error: "Unauthorized"**
- Check JWT token trong localStorage
- Token có thể hết hạn, cần login lại

**Error: "Cannot exchange token"**
- Check Facebook App ID/Secret trong .env
- Verify short-lived token còn valid

**Error: "Account not found"**
- User chưa có accounts được sync
- Cần login với access token để sync accounts

**Campaign push failed**
- Check user có access token long-lived không
- Verify account được chọn có quyền tạo ads không

## Best Practices

1. **Token Management**: Exchange token ngay sau khi login
2. **Account Selection**: Set primary account cho user
3. **Error Handling**: Check authentication trước khi gọi APIs
4. **Data Privacy**: Không share accounts giữa users
5. **Security**: Đổi JWT_SECRET trong production

## Future Enhancements

1. **Role-based Access**: Admin có thể xem tất cả logs
2. **Team Management**: Share accounts trong team
3. **Audit Logs**: Track user activities
4. **API Rate Limiting**: Prevent abuse
5. **Refresh Tokens**: Auto-refresh expired tokens
