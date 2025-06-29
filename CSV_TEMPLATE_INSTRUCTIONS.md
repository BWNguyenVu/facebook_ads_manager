# Facebook Ads Manager - CSV Template Instructions

## Quan trọng: Tránh lỗi Scientific Notation

Khi làm việc với file CSV chứa các ID Facebook (page_id, post_id, account_id), các số này có thể rất lớn và Excel/Google Sheets có thể tự động chuyển đổi chúng thành định dạng khoa học (scientific notation) như `1.04882E+14`.

### Cách khắc phục:

#### 1. Trong Excel:
- Chọn các cột ID (page_id, post_id, account_id) → Right click → Format Cells
- Chọn **Text** (KHÔNG phải Number)
- **QUAN TRỌNG**: PHẢI sử dụng Text format để tránh scientific notation
- Nhập ID dưới dạng text: `104882489141131` (không có dấu nháy kép)

#### 2. Trong Google Sheets:
- Chọn cột ID → Format → Number → Plain text
- **QUAN TRỌNG**: Phải là Plain text format
- Nhập ID trực tiếp hoặc với dấu ' ở đầu: `'104882489141131`

#### 3. Template CSV đã sửa:
File `facebook_campaign_template_final.csv` đã được tạo với định dạng đúng:
```csv
name,page_id,post_id,access_token,daily_budget,age_min,age_max,start_time,end_time,account_id
Campaign Test,104882489141131,724361597203916,YOUR_ACCESS_TOKEN,50000,18,45,2025-07-01T00:00:00+0700,2025-07-10T00:00:00+0700,568800062218281
```

**LƯU Ý quan trọng về format:**
- `name`: text 
- `page_id, post_id, account_id`: **TEXT format** (không có dấu nháy kép trong file)
- `access_token`: text
- `daily_budget, age_min, age_max`: number nguyên
- `start_time, end_time`: text với format ISO

### Lưu ý:
- System đã được cập nhật để tự động xử lý scientific notation
- **CÁC CỘT ID PHẢI LÀ TEXT FORMAT để tránh scientific notation**
- daily_budget phải >= 30,000 VND (khoảng $1.2 USD)  
- start_time phải có format: `YYYY-MM-DDTHH:mm:ss+0700`
- **LUÔN sử dụng TEXT format cho page_id, post_id, account_id**

### Test với dữ liệu mẫu:
1. Download file `facebook_campaign_template_fixed.csv`
2. Thay YOUR_ACCESS_TOKEN bằng token thực của bạn
3. Thay các ID bằng ID thực từ Facebook
4. Upload và test

## Lỗi thường gặp:

### "Invalid post_id parameter"
- Nguyên nhân: post_id bị chuyển thành scientific notation hoặc sai format
- Giải pháp: Dùng Number format với 0 decimal places (KHÔNG dùng Text format)

### Giải pháp cho lỗi "Invalid post_id parameter":

1. **Kiểm tra Post ID thực tế:**
   - Truy cập Facebook Page của bạn
   - Tìm post bạn muốn quảng cáo
   - Lấy ID từ URL: `facebook.com/[page_id]/posts/[post_id]`
   - Hoặc inspect element và tìm `data-ft` attribute

2. **Format đúng cho Excel/Google Sheets:**
   - **BƯỚC 1: Format cột trước khi nhập dữ liệu**
   - Chọn cột page_id, post_id, account_id → Format Cells → Text
   - **BƯỚC 2: Nhập ID trực tiếp**
   - Ví dụ: `104882489141131` (không có dấu nháy kép)
   - **QUAN TRỌNG: KHÔNG được copy từ Excel đã có scientific notation**

3. **Test với dữ liệu thực:**
   - Thay `YOUR_ACCESS_TOKEN` bằng token thực
   - Thay `page_id`, `post_id` bằng ID thực từ Facebook
   - Đảm bảo bạn có quyền access vào page và post

### "Daily budget too low"  
- Nguyên nhân: Budget < 30,000 VND
- Giải pháp: Tăng daily_budget >= 30,000

### "Invalid date format"
- Nguyên nhân: start_time không đúng format
- Giải pháp: Dùng format `2025-07-01T00:00:00+0700`

### "ID format errors"
- Nguyên nhân: ID được format thành text hoặc có dấu nháy kép
- Giải pháp: Format các cột ID thành Number với 0 decimal places
