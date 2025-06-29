# Facebook Enum Auto-Mapping Guide

## Tổng quan
Hệ thống đã được cập nhật để tự động chuyển đổi các giá trị text tự do (human-readable) trong CSV thành enum Facebook API hợp lệ.

## Các trường enum được hỗ trợ

### 1. Campaign Objective (campaign_objective)
Chuyển đổi tự động từ text thường sang Facebook enum:

**Ví dụ mapping:**
- `"Outcome Engagement"` → `"OUTCOME_ENGAGEMENT"`
- `"outcome leads"` → `"OUTCOME_LEADS"`
- `"Sales"` → `"OUTCOME_SALES"`
- `"Traffic"` → `"OUTCOME_TRAFFIC"`
- `"App Promotion"` → `"OUTCOME_APP_PROMOTION"`
- `"Brand Awareness"` → `"OUTCOME_AWARENESS"`

**Các variations được hỗ trợ:**
- Case-insensitive: `engagement`, `Engagement`, `ENGAGEMENT`
- Space variations: `outcome engagement`, `outcome_engagement`
- Shorthand: `leads`, `sales`, `traffic`, `awareness`

### 2. Optimization Goal (optimization_goal)
**Ví dụ mapping:**
- `"Post Engagement"` → `"POST_ENGAGEMENT"`
- `"Link Clicks"` → `"LINK_CLICKS"`
- `"Page Views"` → `"LANDING_PAGE_VIEWS"`
- `"Conversions"` → `"CONVERSIONS"`
- `"Leads"` → `"LEADS"`

### 3. Bid Strategy (bid_strategy)
**Ví dụ mapping:**
- `"Automatic"` → `"LOWEST_COST_WITHOUT_CAP"`
- `"Auto Bid"` → `"LOWEST_COST_WITHOUT_CAP"`
- `"Bid Cap"` → `"LOWEST_COST_WITH_BID_CAP"`
- `"Cost Cap"` → `"COST_CAP"`
- `"Target Cost"` → `"TARGET_COST"`

### 4. Billing Event (billing_event)
**Ví dụ mapping:**
- `"Impressions"` → `"IMPRESSIONS"`
- `"Clicks"` → `"CLICKS"`
- `"Link Clicks"` → `"CLICKS"`
- `"Actions"` → `"ACTIONS"`
- `"Conversions"` → `"ACTIONS"`

## Cách sử dụng trong CSV

### Template CSV mới
```csv
name,page_id,post_id,access_token,daily_budget,age_min,age_max,start_time,end_time,account_id,campaign_objective,optimization_goal,bid_strategy,billing_event
Campaign Test,="104882489141131",="724361597203916",YOUR_ACCESS_TOKEN,50000,18,45,2025-07-01T00:00:00+0700,2025-07-10T00:00:00+0700,="568800062218281",Outcome Engagement,Post Engagement,Automatic,Impressions
```

### Ví dụ các format được chấp nhận
```csv
# Các cách viết này đều được tự động convert:
Campaign 1,.....,Outcome Engagement,Post Engagement,Automatic,Impressions
Campaign 2,.....,outcome leads,link clicks,cost cap,clicks
Campaign 3,.....,Sales,Conversions,Target Cost,Actions
Campaign 4,.....,OUTCOME_TRAFFIC,LANDING_PAGE_VIEWS,LOWEST_COST_WITHOUT_CAP,IMPRESSIONS
```

## Log và Debugging

Khi import CSV, system sẽ log các conversion:
```
✅ Auto-mapped Campaign Objective: "Outcome Engagement" → "OUTCOME_ENGAGEMENT"
✅ Auto-mapped Optimization Goal: "Post Engagement" → "POST_ENGAGEMENT"
✅ Auto-mapped Bid Strategy: "Automatic" → "LOWEST_COST_WITHOUT_CAP"
✅ Auto-mapped Billing Event: "Impressions" → "IMPRESSIONS"
```

## Validation

Sau khi auto-mapping, system sẽ validate các enum values:
- Nếu không nhận dạng được → hiển thị lỗi với danh sách valid values
- Nếu mapping thành công → campaign được thêm vào danh sách hợp lệ

## Mở rộng trong tương lai

Để thêm mapping cho enum mới:
1. Thêm mapping object mới vào `utils.ts`
2. Tạo function `mapNewEnum()` theo pattern hiện có
3. Cập nhật `autoMapFacebookEnums()` để bao gồm trường mới
4. Cập nhật `validateFacebookEnums()` để validate trường mới

## Best Practices

1. **Sử dụng human-readable values**: Viết tự nhiên như "Outcome Engagement" thay vì "OUTCOME_ENGAGEMENT"
2. **Case không quan trọng**: `engagement`, `Engagement`, `ENGAGEMENT` đều OK
3. **Spaces linh hoạt**: `outcome engagement`, `outcome_engagement` đều được
4. **Shorthand OK**: `leads`, `sales`, `traffic` thay vì full name
5. **Check console logs**: Xem log để confirm mapping đúng

## Troubleshooting

**Lỗi: "Invalid campaign objective"**
- Check spelling: `Engagment` → `Engagement`
- Xem danh sách valid values trong error message
- Sử dụng shorthand: `engagement` thay vì `Outcome Engagement`

**Enum không được mapping**
- Check console logs xem có log auto-mapping không
- Thử format khác: spaces, underscores, case khác
- Fallback to exact Facebook enum: `OUTCOME_ENGAGEMENT`
