# Facebook Ads CSV Import Feature

Tính năng này cho phép import campaigns từ Facebook Ads Manager thông qua file CSV export.

## Cách sử dụng

### 1. Export CSV từ Facebook Ads Manager

1. Truy cập Facebook Ads Manager (ads.facebook.com)
2. Chọn tab "Campaigns" hoặc "Ad sets"
3. Chọn các campaigns/ad sets bạn muốn export
4. Click nút "Export" → "Export table data" 
5. Chọn định dạng CSV và download file

### 2. Import vào hệ thống

1. Vào menu "Import Facebook Ads" hoặc click nút "Import CSV" trong trang Campaigns
2. Upload file CSV vừa export từ Facebook
3. Hệ thống sẽ tự động:
   - Parse dữ liệu CSV
   - Map các field tương ứng
   - Tạo campaigns mới trong Facebook Ads

### 3. Các thông tin được import

- **Campaign**: Tên, objective, budget, status, bid strategy
- **Ad Set**: Targeting (location, age, gender), optimization goal, billing event
- **Creative**: Nội dung quảng cáo, call-to-action
- **Geographic Targeting**: Từ địa chỉ GPS coordinates trong CSV

## Mapping Fields

| CSV Field | Facebook API Field | Description |
|-----------|-------------------|-------------|
| Campaign Name | name | Tên campaign |
| Campaign Status | status | ACTIVE/PAUSED |
| Campaign Objective | objective | OUTCOME_ENGAGEMENT, etc. |
| Campaign Daily Budget | daily_budget | Budget hàng ngày (VND) |
| Addresses | geo_locations | GPS coordinates + radius |
| Age Min/Max | age_min/age_max | Độ tuổi target |
| Gender | genders | Nam (1), Nữ (2), Tất cả (1,2) |
| Body | message | Nội dung quảng cáo |
| Call to Action | call_to_action | LEARN_MORE, CONTACT_US, etc. |
| Optimization Goal | optimization_goal | CONVERSATIONS, REACH, etc. |

## Lưu ý quan trọng

1. **Page ID**: Cần có Page ID được cấu hình trong Settings để tạo creative
2. **Access Token**: Phải có access token với quyền ads_management
3. **Ad Account**: Phải chọn ad account trước khi import
4. **Duplicate Campaigns**: Hệ thống tự động loại bỏ campaigns trùng tên
5. **Error Handling**: Nếu có lỗi, chi tiết sẽ hiển thị trong kết quả import

## Troubleshooting

### Lỗi thường gặp:

1. **"Invalid access token"**
   - Kiểm tra access token trong Settings
   - Đảm bảo token chưa hết hạn

2. **"Missing page ID"**
   - Cấu hình Page ID trong Settings
   - Hoặc chọn page khi import

3. **"Campaign creation failed"**
   - Kiểm tra budget minimum (>= 20,000 VND)
   - Đảm bảo targeting location hợp lệ
   - Xem chi tiết lỗi trong Campaign Logs

### Tips để import thành công:

1. Export đầy đủ columns từ Facebook Ads Manager
2. Đảm bảo file CSV không bị lỗi encoding (UTF-8)
3. Kiểm tra GPS coordinates trong Addresses field
4. Xác nhận ad account có đủ quyền tạo campaigns

## File Structure Expected

```csv
Campaign Name,Campaign Status,Campaign Objective,Campaign Daily Budget,Addresses,Age Min,Age Max,Body,Call to Action,...
Sample Campaign,ACTIVE,Outcome Engagement,99000,"(10.7769, 106.7009) +25km",18,65,Amazing content here!,LEARN_MORE,...
```

## API Endpoints

- `POST /api/facebook/import-csv` - Import CSV file
- `GET /api/facebook/campaigns/list` - List campaigns
- `GET /logs` - View import logs

Để biết thêm chi tiết, xem logs trong phần "Campaign Logs" sau khi import.
