# Permalink Post ID Extraction - Update Log

## Enhancement Completed

### Issue Identified
User pointed out that the `Permalink` column contains Facebook post URLs that can be used to extract Post IDs more reliably than the `Story ID` field.

Example Permalink: `https://www.facebook.com/100088902452057/posts/160170150279031`
Extracted Post ID: `160170150279031`

### Solution Implemented

1. **Updated Field Mapping**
   - Added `Permalink` field to `FacebookCsvRow` interface (already existed)
   - Added mapping for `Permalink`, `permalink`, `PERMALINK`, `Post URL`, `post url`, `POST URL` in `normalizeFieldNames`

2. **Enhanced Post ID Extraction Logic**
   - **Priority 1**: Extract from `Permalink` using regex `\/posts\/(\d+)`
   - **Priority 2**: Fallback to `Story ID` using existing logic
   - Supports multiple Facebook URL formats (www, m.facebook.com, with/without query params)

3. **Updated Documentation**
   - Enhanced `FACEBOOK_CSV_EXTENDED_FORMAT.md` with Permalink extraction details
   - Added examples of both Permalink and Story ID formats
   - Updated field mapping documentation

### Code Changes
- `route.ts`: Enhanced `mapFacebookCsvToCampaignData()` function
- Added comprehensive logging to show both Permalink and Story ID values
- Maintains backward compatibility with existing Story ID logic

### Testing
- Created test script confirming proper extraction from various URL formats
- Verified regex handles standard and mobile Facebook URLs
- Confirmed fallback mechanism works correctly

### Result
The system now prioritizes Permalink for Post ID extraction, providing more reliable and standardized post identification from Facebook CSV exports.

## Files Modified
- `/src/app/api/facebook/import-csv/route.ts` - Main logic update
- `/FACEBOOK_CSV_EXTENDED_FORMAT.md` - Documentation update
- `/test_permalink_extraction.js` - Test validation (created)

## Status: ✅ Complete
The Facebook CSV import now correctly prioritizes Permalink over Story ID for post identification, improving reliability and compatibility with newer Facebook export formats.
