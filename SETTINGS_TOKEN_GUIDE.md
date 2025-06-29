# Facebook Ads Manager - Settings & Token Management Guide

## Overview
The updated Facebook Ads Manager now features a dedicated Settings page for managing Facebook app credentials and access tokens. This eliminates the need to include access tokens in CSV files and provides centralized token management.

## New Features

### 🔧 Settings Page
- **Facebook App Configuration**: Configure App ID and App Secret
- **Token Management**: Generate and manage long-lived access tokens
- **Token Validation**: Real-time token status checking
- **Secure Storage**: Tokens stored in localStorage for app usage

### 📁 Simplified CSV Upload
- **No Access Token Required**: CSV files no longer need access_token column
- **Streamlined Format**: Cleaner CSV structure focusing on campaign data
- **Automatic Token Usage**: App automatically uses stored token for API calls

## Getting Started

### 1. Configure Facebook App Settings
1. Navigate to **Settings** from the sidebar
2. Go to **Facebook Configuration** tab
3. Enter your Facebook credentials:
   - **App ID**: Your Facebook App ID
   - **App Secret**: Your Facebook App Secret  
   - **Short-lived Token**: Token from Facebook Graph API Explorer
4. Click **"Save Configuration"**
5. Click **"Generate Long-lived Token"**

### 2. Get Facebook App Credentials

#### Step A: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → "Business" → "Next"
3. Enter app name and contact email
4. Copy your **App ID** and **App Secret**

#### Step B: Get Short-lived Access Token
1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app from dropdown
3. Click "Generate Access Token"
4. Grant permissions:
   - `ads_management`
   - `ads_read`
   - `business_management`
   - `pages_read_engagement`
   - `pages_show_list`
5. Copy the generated token

### 3. Upload CSV (No Access Token Required)

#### New CSV Format
```csv
name,page_id,post_id,daily_budget,age_min,age_max,start_time
Campaign Test,104882489141131,724361597203916,50000,18,45,2025-07-01T00:00:00+0700
```

#### Removed Fields
- ~~`access_token`~~ - Now managed through Settings

#### Required Fields
- `name`: Campaign name
- `page_id`: Facebook Page ID
- `post_id`: Facebook Post ID  
- `daily_budget`: Budget in VND
- `age_min`: Minimum age (18+)
- `age_max`: Maximum age (65 max)
- `start_time`: Start datetime (ISO format)

#### Optional Fields
- `end_time`: Campaign end time
- `account_id`: Ad Account ID
- `campaign_objective`: Campaign objective
- `optimization_goal`: Optimization goal
- `bid_strategy`: Bidding strategy
- `billing_event`: Billing event

## Settings Page Guide

### Facebook Configuration Tab

#### App Credentials Section
- **App ID Field**: Enter your Facebook App ID
- **App Secret Field**: Masked input for security
- **Show/Hide Button**: Toggle secret visibility
- **Save Button**: Store configuration locally

#### Token Generation Section
- **Short-lived Token Field**: Enter token from Graph API Explorer
- **Generate Button**: Convert to long-lived token
- **Status Display**: Shows generation progress

### Token Management Tab

#### Current Token Display
- **Status Badge**: Valid/Invalid/Expired status
- **Token Preview**: Masked token display for security
- **Expiry Date**: When token expires (up to 60 days)
- **User Info**: Associated Facebook user details

#### Token Actions
- **Validate Button**: Check token status with Facebook API
- **Clear Button**: Remove stored tokens
- **Refresh Display**: Update token information

## Token Lifecycle

### 1. Short-lived Token (1-2 hours)
```
Graph API Explorer → Copy Token → Settings Page
```

### 2. Long-lived Token (60 days)
```
Settings Page → Generate → localStorage → App Usage
```

### 3. Automatic Usage
```
CSV Upload → App reads localStorage → API Calls → Campaign Creation
```

### 4. Token Validation
```
Settings Page → Validate → Facebook API → Status Update
```

## Application Workflow

### Updated Campaign Creation Process
1. **Setup**: Configure tokens in Settings (one-time)
2. **Upload**: Upload CSV without access_token column
3. **Validate**: App validates data and token automatically
4. **Create**: Push campaigns using stored token
5. **Monitor**: Track progress and results

### Token Management Best Practices
- **Regular Validation**: Check token status weekly
- **Proactive Renewal**: Renew tokens before expiry
- **Secure Storage**: Never share app secrets
- **Permission Monitoring**: Ensure proper Facebook permissions

## Security Features

### Token Protection
- **Masked Display**: Tokens shown partially for security
- **Local Storage**: Tokens stored in browser only
- **Automatic Validation**: Regular token health checks
- **Secure Transmission**: HTTPS for all token operations

### Configuration Security
- **Secret Masking**: App secrets hidden by default
- **Local Configuration**: Settings stored locally per user
- **No Server Storage**: Sensitive data not sent to server
- **Validation Only**: Server only validates, doesn't store tokens

## Troubleshooting

### Common Issues

#### 1. Token Generation Failed
**Symptoms**: Error when clicking "Generate Long-lived Token"

**Solutions**:
- Verify App ID and App Secret are correct
- Ensure short-lived token is valid and recent
- Check Facebook app permissions
- Try regenerating short-lived token

#### 2. CSV Upload Errors
**Symptoms**: "Access token required" or similar errors

**Solutions**:
- Generate long-lived token in Settings first
- Check token status in Token Management tab
- Validate token before uploading CSV
- Clear and regenerate token if expired

#### 3. Campaign Creation Fails
**Symptoms**: API errors during campaign push

**Solutions**:
- Validate token in Settings page
- Check ad account permissions
- Verify Page ID and Post ID exist
- Ensure account has proper Facebook permissions

#### 4. Token Expired
**Symptoms**: "Invalid token" errors in API calls

**Solutions**:
- Go to Settings → Token Management
- Click "Validate" to check status
- Generate new token if expired
- Update Facebook app permissions if needed

### Debug Steps
1. **Check Settings**: Verify all configuration fields filled
2. **Validate Token**: Use "Validate" button in Token Management
3. **Test Permissions**: Try token in Graph API Explorer
4. **Browser Console**: Check for JavaScript errors
5. **Network Tab**: Monitor API call responses

## Migration from Previous Version

### For Existing CSV Files
1. **Remove access_token column** from existing CSV files
2. **Keep all other columns** as they are
3. **Setup tokens** in Settings page before uploading
4. **Test with small files** first

### For Existing Users
1. **Register/Login** to the application
2. **Go to Settings** and configure Facebook app
3. **Generate tokens** using the Settings page
4. **Re-upload CSV files** with new format
5. **Monitor results** in dashboard

## API Changes

### New Endpoints
- `POST /api/auth/exchange-token` - Enhanced with app credentials
- `GET /api/facebook/campaigns` - Token validation endpoint

### Updated Endpoints
- `POST /api/facebook/campaigns` - Now expects accessToken in request body
- All campaign endpoints now use centralized token management

### Request Format Changes
```javascript
// Old format
{
  campaigns: [
    { name: "Test", access_token: "token123", ... }
  ]
}

// New format  
{
  campaigns: [
    { name: "Test", ... }  // No access_token
  ],
  accessToken: "token123",  // Centralized token
  accountId: "12345"
}
```

## Best Practices

### Setup
1. **One-time Configuration**: Set up Facebook app credentials once
2. **Token Management**: Keep tokens fresh and validated
3. **Permission Monitoring**: Ensure Facebook permissions are maintained
4. **Regular Validation**: Check token status periodically

### Usage
1. **CSV Preparation**: Use new format without access_token
2. **Token Validation**: Always validate before bulk uploads
3. **Error Monitoring**: Watch for token expiry warnings
4. **Backup Plans**: Keep spare tokens ready for renewal

### Security
1. **Secret Protection**: Never share App Secret
2. **Token Rotation**: Regularly rotate access tokens
3. **Permission Auditing**: Review Facebook app permissions
4. **Access Monitoring**: Monitor API usage and costs

## Support Resources

### Facebook Developer Tools
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Facebook App Dashboard](https://developers.facebook.com/apps/)
- [Marketing API Documentation](https://developers.facebook.com/docs/marketing-api)

### Application Features
- Settings page with guided setup
- Real-time token validation
- Comprehensive error reporting
- Automatic token management
- Secure credential storage
