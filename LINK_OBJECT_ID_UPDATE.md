# Link Object ID Page Extraction - Update Log

## Date: June 30, 2025

## Summary
Đã cải thiện logic extract pageId từ trường `Link Object ID` trong CSV Facebook Ads export, ưu tiên Link Object ID hơn Permalink vì độ chính xác cao hơn.

## Problem
- User phát hiện ra trong CSV có trường `Link Object ID` với format `o:677873948736290`
- Phần sau `o:` chính là pageId chính xác từ Facebook
- Link Object ID đáng tin cậy hơn việc parse Permalink

## Solution
Cập nhật logic priority để extract pageId:
1. **PRIORITY 1**: Extract từ `Link Object ID` (format: `o:123456789012345`)
2. **PRIORITY 2**: Extract từ `Permalink` (fallback nếu không có Link Object ID)
3. **PRIORITY 3**: Dùng pageId từ form (fallback cuối cùng)

## Changes Made

### 1. Updated PageID Extraction Logic
- **File**: `src/app/api/facebook/import-csv/route.ts`
- **Function**: `mapFacebookCsvToCampaignData()`
- **What**: Thêm logic extract pageId từ Link Object ID trước khi try Permalink

```javascript
// PRIORITY 1: Extract pageId from Link Object ID (most reliable)
if (csvRow['Link Object ID'] && csvRow['Link Object ID'].trim()) {
  const linkObjectId = csvRow['Link Object ID'].trim();
  console.log('Processing Link Object ID:', linkObjectId);
  
  // Facebook Link Object ID format: o:123456789012345
  const linkObjectMatch = linkObjectId.match(/^o:(\d+)$/);
  if (linkObjectMatch) {
    pageId = linkObjectMatch[1];
    console.log('✅ Extracted Page ID from Link Object ID:', pageId);
  }
}

// PRIORITY 2: Extract from Permalink (fallback if no Link Object ID)
if (!pageId && csvRow['Permalink'] && csvRow['Permalink'].trim()) {
  // ... existing permalink logic ...
}
```

### 2. Added Link Object ID to Interface
- **File**: `src/app/api/facebook/import-csv/route.ts`
- **What**: Thêm `'Link Object ID'?: string;` vào `FacebookCsvRow` interface

### 3. Updated Field Mapping
- **File**: `src/app/api/facebook/import-csv/route.ts`
- **What**: Thêm field mapping cho Link Object ID
```javascript
'Link Object ID': [
  'Link Object ID', 
  'link object id', 
  'LINK OBJECT ID', 
  'Link_Object_ID', 
  'Object ID', 
  'object id', 
  'OBJECT ID'
]
```

### 4. Enhanced Logging
- **What**: Thêm thông tin Link Object ID và page ID source vào debug log
```javascript
console.log('Mapping CSV row:', {
  campaignName: csvRow['Campaign Name'],
  linkObjectId: csvRow['Link Object ID'],
  permalink: csvRow['Permalink'],
  extractedPageId: pageId,
  pageIdSource: csvRow['Link Object ID'] ? 'Link Object ID' : 
               (csvRow['Permalink'] ? 'Permalink' : 'None')
});
```

### 5. Testing
- **File**: `test_linkobjectid_extraction.js`
- **What**: Test script để verify logic extraction với các format Link Object ID
- **Results**: ✅ All test cases passed

## Link Object ID Format
- **Valid**: `o:677873948736290` → pageId: `677873948736290`
- **Valid**: `o:100088902452057` → pageId: `100088902452057`
- **Invalid**: `677873948736290` (missing `o:` prefix)
- **Invalid**: `o:abc123456789` (non-numeric after `o:`)
- **Invalid**: `o:` (empty after `o:`)

## Benefits

1. **Higher Accuracy**: Link Object ID từ Facebook export chính xác 100%
2. **Better Priority**: Ưu tiên data chính xác từ Facebook hơn parse Permalink
3. **Fallback Support**: Vẫn support Permalink nếu không có Link Object ID
4. **Better Debugging**: Log chi tiết về nguồn pageId (Link Object ID vs Permalink)

## Example CSV Data
```
Link Object ID: o:100088902452057
Permalink: https://www.facebook.com/100088902452057/posts/160170150279031
```

**Result**: 
- pageId: `100088902452057` (from Link Object ID)
- postId: `160170150279031` (from Permalink)
- pageIdSource: `Link Object ID`

## Error Handling
- Nếu Link Object ID format sai → fallback về Permalink
- Nếu cả hai đều không có → fallback về form pageId
- Nếu không có pageId nào → show error "Page ID is required"

## Compatibility
- ✅ Backward compatible với CSV không có Link Object ID
- ✅ Support cả format cũ và mới của Facebook export
- ✅ Không breaking changes với existing workflow

## Status: ✅ Completed & Ready for Testing

Giờ đây hệ thống sẽ ưu tiên Link Object ID (chính xác nhất) → Permalink → Form pageId để đảm bảo độ chính xác cao nhất khi import campaign từ CSV.
