# Facebook CSV Import - Extended Format Support

## Enhanced CSV Format Support

The Facebook CSV import functionality has been updated to support the extended Facebook Ads Manager export format with 400+ columns.

## New Features Added

### 1. **Extended Field Mapping**
Added support for additional Facebook export fields:
- `Countries`, `Cities`, `Regions`, `Zip` - Geographic targeting
- `Ad Set Daily Budget` - Alternative budget source
- `Ad Name`, `Title`, `Display Link` - Enhanced creative data
- `Image Hash`, `Video ID` - Media assets
- `Advantage Audience` - Targeting automation setting

### 2. **Flexible Location Targeting**
- **Custom Locations**: Coordinate-based targeting (older format)
  ```
  Addresses: "(13.525869, 108.315622) +7km"
  ```
- **Country Targeting**: Country-based targeting (newer format)
  ```
  Countries: "VN"
  ```
- **Fallback**: Default to Vietnam if no location specified

### 3. **Enhanced Budget Handling**
Priority order for budget detection:
1. `Ad Set Daily Budget` (preferred)
2. `Campaign Daily Budget` (fallback)
3. Default: 50,000 VND

### 4. **Advantage Audience Integration**
Reads `Advantage Audience` field from CSV:
- `1` / `true` / `yes` → Enable Advantage Audience
- Default: Disabled (0)

### 5. **Enhanced Post ID Extraction**
Priority order for extracting Facebook post ID:
1. `Permalink` (preferred) - Extracts ID from Facebook post URL
   ```
   Permalink: "https://www.facebook.com/100088902452057/posts/160170150279031"
   → Post ID: "160170150279031"
   ```
2. `Story ID` (fallback) - Legacy format support
   ```
   Story ID: "s:160170150279031" or "160170150279031"
   → Post ID: "160170150279031"
   ```

### 6. **Improved Creative Data**
- Uses `Display Link` from CSV if available
- Supports `Ad Name` field for ad naming
- Fallback to safe defaults if fields missing

## Targeting Structure Examples

### Custom Location (Coordinates)
```typescript
targeting: {
  geo_locations: {
    custom_locations: [{
      latitude: 13.525869,
      longitude: 108.315622,
      radius: 7,
      distance_unit: 'kilometer'
    }]
  },
  genders: [1, 2],
  age_min: 18,
  age_max: 65,
  targeting_automation: {
    advantage_audience: 1
  }
}
```

### Country Targeting
```typescript
targeting: {
  geo_locations: {
    countries: ['VN']
  },
  genders: [1, 2],
  age_min: 18,
  age_max: 65,
  targeting_automation: {
    advantage_audience: 0
  }
}
```

## Supported CSV Formats

### Format 1: Basic Export (45 columns)
- Campaign Name, Status, Objective
- Addresses (coordinate format)
- Basic targeting and creative fields

### Format 2: Extended Export (400+ columns)
- All Format 1 fields
- Countries, Cities, Regions
- Extended creative options (Permalink, Display Link)
- Advanced targeting settings (Advantage Audience)
- Multiple budget fields (Ad Set Daily Budget)

## Key Fields Mapping

### Post Identification
- **Permalink** → Extract post ID from Facebook URL
- **Story ID** → Legacy post ID format (fallback)

### Geographic Targeting
- **Addresses** → Custom coordinates (older format)
- **Countries** → Country codes (newer format)
- **Cities, Regions, Zip** → Additional location data

### Budget & Optimization
- **Ad Set Daily Budget** → Primary budget source
- **Campaign Daily Budget** → Fallback budget
- **Advantage Audience** → Targeting automation (1/0)

### Creative Content
- **Display Link** → Link destination
- **Ad Name** → Ad naming
- **Body** → Ad text content
- **Destination Type** → Ad set destination (WEBSITE, MESSENGER, APP, etc.)
- **Call to Action** → Auto-adjusted based on destination type

## File Processing

### Encoding Support
- ✅ UTF-8, UTF-16LE, Windows-1252
- ✅ BOM handling
- ✅ Control character cleanup

### CSV Parsing
- ✅ Tab and comma delimiter detection
- ✅ Quoted field handling
- ✅ Multiline content support
- ✅ Error-tolerant parsing

## Error Handling

### Validation
- ✅ Required field detection
- ✅ Campaign name validation
- ✅ Budget format validation
- ✅ Coordinate parsing validation

### Fallbacks
- ✅ Default targeting (Vietnam)
- ✅ Default budget (50,000 VND)
- ✅ Safe creative defaults
- ✅ Standard field mapping

## Usage Instructions

1. **Export from Facebook Ads Manager**
   - Use either basic or extended export format
   - Include campaign, ad set, and ad data

2. **Upload via CSV Import Tool**
   - Select exported CSV file
   - Configure account ID and access token
   - Optional: Set page ID for creatives

3. **Review and Import**
   - Preview parsed data
   - Check targeting and budget mapping
   - Execute import

## Technical Implementation

### Files Modified
- `src/app/api/facebook/import-csv/route.ts` - Main import logic
- Field mapping expanded for 400+ column support
- Targeting logic updated for dual format support
- Budget parsing enhanced for multiple sources

### Dependencies
- PapaParse for CSV processing
- Facebook Graph API v23.0
- MongoDB for logging

The system now supports both legacy and modern Facebook CSV export formats, providing robust data mapping and error handling for real-world Facebook Ads Manager exports.
