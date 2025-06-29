# Facebook Ad Account Selection Guide

## 📋 Overview

Trong phiên bản mới, bạn có thể dễ dàng lấy danh sách Facebook Ad Accounts và chọn account mặc định cho việc tạo campaigns, thay vì phải nhập account ID thủ công.

## 🎯 Tính năng chính

### 1. **Tự động lấy danh sách Ad Accounts**
- Kết nối trực tiếp với Facebook Graph API
- Hiển thị tất cả ad accounts bạn có quyền truy cập
- Thông tin chi tiết: tên account, business, currency, trạng thái

### 2. **Chọn Account mặc định**
- Giao diện radio button dễ sử dụng
- Lưu lựa chọn tự động vào localStorage
- Đồng bộ với tất cả tính năng upload/dashboard

### 3. **Không cần access_token trong CSV**
- CSV file chỉ cần dữ liệu campaign
- Access token và account ID lấy từ Settings
- Đơn giản hóa quy trình upload

## 🚀 Hướng dẫn sử dụng

### Bước 1: Cấu hình Facebook App
1. Đi đến **Settings** → **Facebook Configuration**
2. Nhập:
   - **App ID**: Facebook App ID của bạn
   - **App Secret**: Facebook App Secret
   - **Short-lived Access Token**: Token từ Graph API Explorer
3. Nhấn **Save Configuration**

### Bước 2: Tạo Long-lived Token
1. Trong tab **Token Management**
2. Nhấn **Generate Long-lived Token**
3. Token sẽ có hiệu lực 60 ngày
4. Hệ thống tự động đồng bộ Facebook accounts

### Bước 3: Chọn Ad Account
1. Chuyển đến tab **Ad Accounts**
2. Nhấn **Load Ad Accounts** để lấy danh sách từ Facebook
3. Chọn account bạn muốn sử dụng mặc định
4. Account được chọn sẽ được highlight và hiển thị badge "Selected"

### Bước 4: Upload Campaigns
1. Đi đến **Upload** page
2. Upload CSV file (không cần access_token trong file)
3. Hệ thống tự động sử dụng access token và account ID đã chọn
4. Xem preview và push campaigns

## 📁 CSV Format (Simplified)

Với tính năng mới, CSV file chỉ cần các cột sau:

```csv
name,page_id,post_id,daily_budget,age_min,age_max,start_time,end_time
Campaign Test 1,123456789,987654321,1000,18,65,2024-01-15T00:00:00Z,2024-01-30T23:59:59Z
Campaign Test 2,123456789,987654322,1500,25,45,2024-01-16T00:00:00Z,2024-01-31T23:59:59Z
```

**Không cần:**
- ❌ `access_token` (lấy từ Settings)
- ❌ `account_id` (chọn từ Settings)

**Cần có:**
- ✅ Tất cả các cột khác như cũ

## ⚠️ Lưu ý quan trọng

### Permissions Facebook App
Đảm bảo Facebook App có các permissions:
- `ads_management`
- `ads_read`
- `business_management`
- `pages_read_engagement`

### Token Expiry
- Short-lived token: 1-2 giờ
- Long-lived token: 60 ngày
- Hệ thống sẽ cảnh báo khi token sắp hết hạn

### Account Status
- Chỉ chọn accounts có trạng thái "Active"
- Inactive accounts sẽ được hiển thị nhưng có badge cảnh báo

## 🔧 Troubleshooting

### "No ad accounts loaded"
1. Kiểm tra long-lived token đã được tạo chưa
2. Đảm bảo token chưa hết hạn
3. Kiểm tra permissions của Facebook App

### "Setup Required" khi upload
1. Vào Settings → Token Management kiểm tra token
2. Vào Settings → Ad Accounts chọn account
3. Đảm bảo account đã được selected

### Token không hoạt động
1. Tạo lại short-lived token từ Graph API Explorer
2. Generate lại long-lived token
3. Load lại ad accounts

## 💡 Best Practices

1. **Thường xuyên refresh token** trước khi hết hạn
2. **Chọn account chính** cho mỗi business
3. **Kiểm tra account status** trước khi push campaigns
4. **Backup cấu hình** Facebook App credentials
5. **Monitor token expiry** trong Settings

## 🔄 Migration từ phiên bản cũ

Nếu bạn đang sử dụng phiên bản cũ với CSV có access_token:

1. **Tạo CSV mới** không có cột `access_token` và `account_id`
2. **Cấu hình Settings** theo hướng dẫn trên
3. **Chọn account** từ danh sách Facebook
4. **Upload file mới** với format đơn giản

Hoặc tiếp tục sử dụng CSV cũ, hệ thống sẽ ưu tiên:
1. Access token từ Settings (nếu có)
2. Account ID từ Settings (nếu có)
3. Fallback sang CSV (nếu Settings chưa cấu hình)

---

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra console logs để xem lỗi chi tiết
2. Verify Facebook App permissions
3. Đảm bảo token còn hiệu lực
4. Liên hệ support team với thông tin cụ thể

**Happy Campaign Management! 🚀**
