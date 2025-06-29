# HƯỚNG DẪN TRÁNH LỖI SCIENTIFIC NOTATION - CHI TIẾT

## Vấn đề: 
Khi mở file CSV bằng Excel, Excel tự động chuyển ID thành scientific notation (`7.24362E+14`).

## Giải pháp có 4 cách (theo thứ tự khuyến nghị):

### CÁCH 1: Sử dụng file TXT template (KHUYẾN CÁO NHẤT)
1. Trong ứng dụng, click **"Download TXT Template (Excel-safe)"**
2. File này sử dụng tab-separated format, Excel sẽ không tự động convert
3. Mở bằng Excel: File → Open → Chọn file .txt → Text Import Wizard sẽ mở
4. Chọn "Delimited" → Next → Chọn "Tab" → Next → **QUAN TRỌNG**: Chọn các cột ID và set "Text" → Finish
5. Edit dữ liệu, Save as CSV khi xong

### CÁCH 2: Sử dụng CSV template với Excel formula  
1. Download file: `facebook_campaign_template_text_format.csv`
2. File này sử dụng format `="123456"` để force Excel coi như text
3. Mở bằng Excel và sửa trực tiếp, ID sẽ không bị convert
4. Save as CSV khi xong

### CÁCH 3: Import vào Excel đúng cách
1. Mở Excel → Data → Get Data → From Text/CSV
2. Chọn file CSV
3. Trong preview, chọn các cột ID → Change type → Text  
4. Click Load
5. Bây giờ có thể edit mà không bị scientific notation

### CÁCH 4: Tạo file từ đầu trong Excel
1. Mở Excel mới
2. **TRƯỚC KHI nhập bất kỳ dữ liệu nào**:
   - Chọn cột B (page_id) → Format Cells → Text
   - Chọn cột C (post_id) → Format Cells → Text  
   - Chọn cột J (account_id) → Format Cells → Text
3. Nhập headers và dữ liệu
4. Save as CSV

### BƯỚC 2: Lấy ID từ Facebook
- Vào Facebook page của bạn
- Tìm post muốn quảng cáo
- Lấy ID từ URL hoặc source code
- Copy ID CHÍNH XÁC (ví dụ: `724361597203916`)

### BƯỚC 3: Export CSV đúng cách
- File → Save As → CSV (UTF-8)
- Mở file CSV bằng text editor để check: ID phải là số nguyên không có `E+`

### BƯỚC 4: Test
- Upload file CSV vào system
- Check console log để xem ID có được parse đúng không

## VÍ DỤ FILE CSV ĐÚNG:

### File với Excel formula (KHUYẾN CÁO):
```
name,page_id,post_id,access_token,daily_budget,age_min,age_max,start_time,end_time,account_id
Campaign Test,="104882489141131",="724361597203916",YOUR_ACCESS_TOKEN,50000,18,45,2025-07-01T00:00:00+0700,2025-07-10T00:00:00+0700,="568800062218281"
```

### File CSV thông thường:
```
name,page_id,post_id,access_token,daily_budget,age_min,age_max,start_time,end_time,account_id
Campaign Test,104882489141131,724361597203916,YOUR_ACCESS_TOKEN,50000,18,45,2025-07-01T00:00:00+0700,2025-07-10T00:00:00+0700,568800062218281
```

## LƯU Ý:
- Format `="123456"` sẽ hiển thị như `123456` trong Excel nhưng được lưu như text
- System tự động xử lý cả hai format
- Nếu dùng Google Sheets, format thông thường là OK

## KIỂM TRA:
- Không được có `E+` trong ID fields
- ID phải là chuỗi số nguyên dài 15-16 ký tự
- System sẽ log việc parse để debug
