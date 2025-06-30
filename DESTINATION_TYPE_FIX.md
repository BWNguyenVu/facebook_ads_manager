# Destination Type Support - Update Log

## Enhancement Completed

### Issue Identified
User pointed out that CSV file contains `Destination Type: MESSENGER` but when creating ad set, it was defaulting to `ON_POST` instead of using the correct destination type from CSV.

### Root Cause
The system was:
1. ✅ Mapping `Destination Type` field in `normalizeFieldNames()`
2. ❌ NOT using the mapped value in `mapFacebookCsvToCampaignData()`
3. ❌ Defaulting to `ON_POST` in Facebook API call

### Solution Implemented

1. **Added Destination Type Mapping Logic**
   ```typescript
   // Map destination type from CSV (before CTA mapping)
   let destinationType = 'WEBSITE'; // Default destination type
   if (csvRow['Destination Type'] && csvRow['Destination Type'].trim()) {
     const destType = csvRow['Destination Type'].trim().toUpperCase();
     // Facebook supported destination types
     const validDestTypes = ['WEBSITE', 'MESSENGER', 'APP', 'PHONE_CALL', 'CANVAS'];
     if (validDestTypes.includes(destType)) {
       destinationType = destType;
     }
   }
   ```

2. **Added destination_type to Campaign Data**
   ```typescript
   const result = {
     // ... other fields
     destination_type: destinationType, // Use destination type from CSV
     // ...
   }
   ```

3. **Enhanced CTA Logic for MESSENGER**
   ```typescript
   // Auto-adjust CTA for MESSENGER destination type
   if (destinationType === 'MESSENGER' && callToAction === 'LEARN_MORE') {
     callToAction = 'MESSAGE_PAGE';
   }
   ```

4. **Enhanced Logging**
   - Added `destination_type` to console.log output for debugging
   - Shows mapped destination type in campaign data log

### Supported Destination Types
- `WEBSITE` (default)
- `MESSENGER` (automatically sets CTA to MESSAGE_PAGE if needed)
- `APP`
- `PHONE_CALL`
- `CANVAS`

### Facebook API Integration
The existing `facebookApi.ts` already had support for `destination_type`:
```typescript
destination_type: mappedCampaignData.destination_type || 'ON_POST',
```

Now it will use the correct value from CSV instead of defaulting to `ON_POST`.

### Result
- ✅ CSV `Destination Type: MESSENGER` → Ad Set `destination_type: MESSENGER`
- ✅ Automatic CTA adjustment: `LEARN_MORE` → `MESSAGE_PAGE` for MESSENGER
- ✅ Backward compatibility with default `WEBSITE` for missing values
- ✅ Validation against Facebook's supported destination types

## Files Modified
- `/src/app/api/facebook/import-csv/route.ts` - Added destination type mapping logic

## Status: ✅ Complete
The system now correctly maps and uses the `Destination Type` field from Facebook CSV exports, ensuring MESSENGER campaigns are created with the proper destination type and call-to-action.

## Test Case
```
CSV Input: Destination Type = "MESSENGER"
Result: 
- destination_type = "MESSENGER" 
- call_to_action = "MESSAGE_PAGE" (auto-adjusted)
```
