# Page ID Auto-Extraction from Permalink - Update Log

## Date: June 30, 2025

## Summary
Đã cải thiện tính năng import CSV Facebook Ads để tự động extract pageId từ Permalink field trong CSV, ưu tiên pageId từ Permalink hơn form input, và cải thiện UI hiển thị nút redirect.

## Changes Made

### 1. Improved PageID Extraction Logic
- **File**: `src/app/api/facebook/import-csv/route.ts`
- **What**: Cải thiện logic extract pageId từ Permalink
- **Details**:
  - Ưu tiên pageId extracted từ Permalink thay vì form input
  - Hỗ trợ các format Permalink:
    - `https://www.facebook.com/61576064618461/videos/1060318432825581`
    - `https://www.facebook.com/100063534491565/videos/1334000001201802` 
    - `https://www.facebook.com/61574647957539/posts/pfbid02bZvLqysm35xyXF7mCQXzte2qjPeq8h16aMxsRzs74GT5ib1fWDpkktAKtTKU3okZl`
  - Chỉ accept numeric page IDs (skip username pages)
  - Thêm logging chi tiết cho process extraction

### 2. Priority Logic for Page ID
- **Before**: Form pageId > Extracted pageId
- **After**: Extracted pageId > Form pageId  
- **Reason**: Permalink trong CSV thường chính xác hơn vì đó là dữ liệu thực tế từ Facebook

### 3. Enhanced UI for Redirect
- **File**: `src/components/FacebookCsvImporter.tsx`
- **What**: Cải thiện UI hiển thị nút redirect
- **Details**:
  - Thêm message "Campaign created successfully!"
  - Đổi tên button: "View Campaign" → "Open Campaign"
  - Better spacing và layout
  - User có thể click để redirect sang Facebook (không auto redirect)

### 4. Testing
- **File**: `test_pageid_extraction.js`
- **What**: Test script để verify logic extraction
- **Results**: ✅ All test cases passed
  ```
  URL 1: pageId="61576064618461", postId="1060318432825581" ✅
  URL 2: pageId="100063534491565", postId="1334000001201802" ✅  
  URL 3: pageId="61574647957539", postId="pfbid...okZl" ✅
  ```

## Technical Implementation

### Page ID Extraction Regex
```javascript
const pageMatch = permalink.match(/facebook\.com\/([^\/]+)\/(?:posts|videos)\//);
if (pageMatch) {
  const extractedPageId = pageMatch[1];
  if (/^\d+$/.test(extractedPageId)) {
    pageId = extractedPageId;
  }
}
```

### Post ID Extraction Regex  
```javascript
const permalinkMatch = permalink.match(/\/(?:posts|videos)\/([^/?]+)/);
if (permalinkMatch) {
  postId = permalinkMatch[1];
}
```

### Priority Logic
```javascript
const extractedPageId = campaignData.page_id; // From Permalink
const formPageId = pageId; // From form  
const effectivePageId = extractedPageId || formPageId; // Prioritize extracted
```

## Benefits

1. **Auto Page ID Detection**: User không cần nhập Page ID nếu CSV có Permalink
2. **Higher Accuracy**: Permalink từ Facebook export chính xác hơn manual input
3. **Better UX**: User thấy rõ ràng campaign đã tạo thành công và có thể redirect
4. **No Auto Redirect**: User control khi nào muốn xem campaign (không bị force redirect)

## Error Handling

- Nếu không extract được pageId từ Permalink → fallback về form pageId
- Nếu không có pageId nào → show error "Page ID is required"
- Logging chi tiết để debug: extracted vs form vs final pageId

## User Experience

1. User upload CSV có Permalink → System auto extract pageId
2. Import thành công → Hiển thị kết quả với nút redirect  
3. User click nút → Mở Facebook campaign/adset/ad trong tab mới
4. User có control hoàn toàn về việc redirect (không bị force)

## Next Steps

- Monitor thực tế để đảm bảo logic extract pageId hoạt động với nhiều format CSV khác nhau
- Có thể thêm fallback logic cho trường hợp edge cases
- Cân nhắc thêm tùy chọn "Auto open after import" nếu user muốn

## Status: ✅ Completed & Ready for Testing
