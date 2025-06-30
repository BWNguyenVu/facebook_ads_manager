import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { campaignLogService } from '@/lib/mongodb';
import { FacebookAPI, createFullCampaign } from '@/lib/facebookApi';
import * as Papa from 'papaparse';

interface FacebookCsvRow {
  'Campaign ID'?: string;
  'Campaign Name': string;
  'Campaign Status': string;
  'Campaign Objective': string;
  'Campaign Daily Budget': string;
  'Campaign Bid Strategy': string;
  'Ad Set Name': string;
  'Ad Set Daily Budget'?: string;
  'Destination Type'?: string;
  'Gender': string;
  'Age Min': string;
  'Age Max': string;
  'Location Types': string;
  'Addresses': string;
  'Body': string;
  'Call to Action': string;
  'Optimization Goal': string;
  'Publisher Platforms': string;
  'Facebook Positions': string;
  'Device Platforms': string;
  'Billing Event': string;
  'Ad Set Run Status'?: string;
  'Ad Status'?: string;
  'Story ID'?: string;
  'Countries'?: string;
  'Cities'?: string;
  'Regions'?: string;
  'Zip'?: string;
  'Geo Markets (DMA)'?: string;
  'Ad Name'?: string;
  'Title'?: string;
  'Display Link'?: string;
  'Link Description'?: string;
  'Image Hash'?: string;
  'Video ID'?: string;
  'Advantage Audience'?: string;
  'Permalink'?: string;
  'Link Object ID'?: string;
  [key: string]: string | undefined;
}

function normalizeFieldNames(row: any): FacebookCsvRow {
  const normalized: any = {};
  
  // Field mapping to handle different column names from Facebook exports
  const fieldMapping: { [key: string]: string[] } = {
    'Campaign Name': ['Campaign Name', 'campaign name', 'CAMPAIGN NAME', 'Campaign_Name', 'Name'],
    'Campaign Status': ['Campaign Status', 'campaign status', 'CAMPAIGN STATUS', 'Status'],
    'Campaign Objective': ['Campaign Objective', 'campaign objective', 'CAMPAIGN OBJECTIVE', 'Objective'],
    'Campaign Daily Budget': ['Campaign Daily Budget', 'campaign daily budget', 'CAMPAIGN DAILY BUDGET', 'Daily Budget', 'Budget', 'Ad Set Daily Budget'],
    'Campaign Bid Strategy': ['Campaign Bid Strategy', 'campaign bid strategy', 'CAMPAIGN BID STRATEGY', 'Bid Strategy', 'Ad Set Bid Strategy'],
    'Ad Set Name': ['Ad Set Name', 'ad set name', 'AD SET NAME', 'Adset Name'],
    'Optimization Goal': ['Optimization Goal', 'optimization goal', 'OPTIMIZATION GOAL'],
    'Billing Event': ['Billing Event', 'billing event', 'BILLING EVENT'],
    'Gender': ['Gender', 'gender', 'GENDER'],
    'Age Min': ['Age Min', 'age min', 'AGE MIN', 'Minimum Age'],
    'Age Max': ['Age Max', 'age max', 'AGE MAX', 'Maximum Age'],
    'Addresses': ['Addresses', 'addresses', 'ADDRESSES', 'Location'],
    'Location Types': ['Location Types', 'location types', 'LOCATION TYPES'],
    'Body': ['Body', 'body', 'BODY', 'Ad Text', 'Message'],
    'Call to Action': ['Call to Action', 'call to action', 'CALL TO ACTION', 'CTA'],
    'Publisher Platforms': ['Publisher Platforms', 'publisher platforms', 'PUBLISHER PLATFORMS'],
    'Facebook Positions': ['Facebook Positions', 'facebook positions', 'FACEBOOK POSITIONS'],
    'Device Platforms': ['Device Platforms', 'device platforms', 'DEVICE PLATFORMS'],
    'Ad Set Run Status': ['Ad Set Run Status', 'ad set run status', 'AD SET RUN STATUS', 'Ad Set Status'],
    'Ad Status': ['Ad Status', 'ad status', 'AD STATUS'],
    'Story ID': ['Story ID', 'story id', 'STORY ID', 'Post ID', 'post id', 'POST ID'],
    'Countries': ['Countries', 'countries', 'COUNTRIES'],
    'Cities': ['Cities', 'cities', 'CITIES'],
    'Regions': ['Regions', 'regions', 'REGIONS'],
    'Zip': ['Zip', 'zip', 'ZIP'],
    'Geo Markets (DMA)': ['Geo Markets (DMA)', 'geo markets (dma)', 'GEO MARKETS (DMA)', 'DMA'],
    'Ad Name': ['Ad Name', 'ad name', 'AD NAME'],
    'Title': ['Title', 'title', 'TITLE'],
    'Display Link': ['Display Link', 'display link', 'DISPLAY LINK'],
    'Link Description': ['Link Description', 'link description', 'LINK DESCRIPTION'],
    'Image Hash': ['Image Hash', 'image hash', 'IMAGE HASH'],
    'Video ID': ['Video ID', 'video id', 'VIDEO ID'],
    'Destination Type': ['Destination Type', 'destination type', 'DESTINATION TYPE'],
    'Advantage Audience': ['Advantage Audience', 'advantage audience', 'ADVANTAGE AUDIENCE'],
    'Permalink': ['Permalink', 'permalink', 'PERMALINK'],
    'Link Object ID': ['Link Object ID', 'link object id', 'LINK OBJECT ID', 'Link_Object_ID', 'Object ID', 'object id', 'OBJECT ID']
  };
  
  // Get all available field names from the row
  const availableFields = Object.keys(row);
  
  // Map each standard field name to the actual field name in the CSV
  for (const [standardField, possibleNames] of Object.entries(fieldMapping)) {
    let foundValue = '';
    
    // Try to find the field in the row
    for (const possibleName of possibleNames) {
      if (availableFields.includes(possibleName)) {
        foundValue = row[possibleName] || '';
        break;
      }
    }
    
    normalized[standardField] = foundValue;
  }
  
  // Copy any additional fields that might be useful
  for (const [key, value] of Object.entries(row)) {
    if (!normalized.hasOwnProperty(key)) {
      normalized[key] = value;
    }
  }
  
  return normalized as FacebookCsvRow;
}

function mapFacebookCsvToCampaignData(csvRow: FacebookCsvRow) {
  // Extract post ID and page ID from Link Object ID, Permalink or Story ID field
  let postId = '';
  let pageId = '';
  
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
    const permalink = csvRow['Permalink'].trim();
    console.log('Processing Permalink (fallback):', permalink);
    
    // Facebook Permalink formats:
    // 1. https://www.facebook.com/100088902452057/posts/160170150279031 (numeric page, numeric post)
    // 2. https://www.facebook.com/100088902452057/posts/pfbid02p4JyZ3Pm54abTtZ6sASUvmjSwEPt7axeaLzEiTmJjYSTZe7yeLFrUd4s521AyRiTl (numeric page, pfbid post)
    // 3. https://www.facebook.com/61576064618461/videos/1060318432825581 (numeric page, video)
    
    // Extract page ID (comes before /posts/ or /videos/)
    const pageMatch = permalink.match(/facebook\.com\/([^\/]+)\/(?:posts|videos)\//);
    if (pageMatch) {
      const extractedPageId = pageMatch[1];
      // Only use if it's a numeric page ID (Facebook page IDs are typically numeric)
      if (/^\d+$/.test(extractedPageId)) {
        pageId = extractedPageId;
        console.log('✅ Extracted Page ID from Permalink (fallback):', pageId);
      } else {
        console.log('⚠️ Skipping non-numeric Page ID from Permalink:', extractedPageId);
      }
    }
  }
  
  // Extract post/video ID from Permalink (regardless of pageId source)
  if (csvRow['Permalink'] && csvRow['Permalink'].trim()) {
    const permalink = csvRow['Permalink'].trim();
    const permalinkMatch = permalink.match(/\/(?:posts|videos)\/([^/?]+)/);
    if (permalinkMatch) {
      postId = permalinkMatch[1];
      console.log('✅ Extracted Post/Video ID from Permalink:', postId);
    }
  }
  
  // Fallback to Story ID if Permalink not found
  if (!postId && csvRow['Story ID'] && csvRow['Story ID'].trim()) {
    const storyId = csvRow['Story ID'].trim();
    // Facebook Story ID format is usually s:123456789012345 or just the numeric part
    const postIdMatch = storyId.match(/s:(\d+)|^(\d+)$/);
    if (postIdMatch) {
      postId = postIdMatch[1] || postIdMatch[2];
    }
  }

  console.log('Mapping CSV row:', {
    campaignName: csvRow['Campaign Name'],
    availableFields: Object.keys(csvRow).slice(0, 10),
    linkObjectId: csvRow['Link Object ID'],
    permalink: csvRow['Permalink'],
    storyId: csvRow['Story ID'],
    extractedPostId: postId,
    extractedPageId: pageId,
    pageIdSource: csvRow['Link Object ID'] ? 'Link Object ID' : (csvRow['Permalink'] ? 'Permalink' : 'None')
  });

  // Parse location from Addresses field or Countries field (different CSV formats)
  let latitude = 10.7769; // Default to Ho Chi Minh City
  let longitude = 106.7009;
  let radius = 25;
  let hasCustomLocation = false;
  
  // Check for coordinate-based targeting (older format)
  if (csvRow['Addresses'] && csvRow['Addresses'].trim()) {
    const addressMatch = csvRow['Addresses'].match(/\(([\d.-]+),\s*([\d.-]+)\)\s*\+(\d+)km/);
    if (addressMatch) {
      latitude = parseFloat(addressMatch[1]);
      longitude = parseFloat(addressMatch[2]);
      radius = parseInt(addressMatch[3]);
      hasCustomLocation = true;
    }
  }
  
  // Check for country-based targeting (newer format)
  let countries: string[] = [];
  if (csvRow['Countries'] && csvRow['Countries'].trim()) {
    countries = csvRow['Countries'].split(',').map(c => c.trim()).filter(c => c.length > 0);
  }

  // Map gender - handle empty values
  let genders: number[] = [1, 2]; // Default to all genders
  if (csvRow['Gender'] && csvRow['Gender'].trim()) {
    const gender = csvRow['Gender'].toLowerCase();
    if (gender === 'male') genders = [1];
    else if (gender === 'female') genders = [2];
  }

  // Handle advantage_audience setting from CSV
  let advantageAudience = 0; // Default to disabled
  if (csvRow['Advantage Audience'] && csvRow['Advantage Audience'].trim()) {
    const advantageValue = csvRow['Advantage Audience'].toLowerCase();
    if (advantageValue === '1' || advantageValue === 'true' || advantageValue === 'yes') {
      advantageAudience = 1;
    }
  }
  const ageMin = csvRow['Age Min'] && csvRow['Age Min'].trim() ? 
    parseInt(csvRow['Age Min']) : 18;
  const ageMax = csvRow['Age Max'] && csvRow['Age Max'].trim() ? 
    parseInt(csvRow['Age Max']) : 65;

  // Map optimization goal with more mapping options
  const optimizationGoalMap: { [key: string]: string } = {
    'CONVERSATIONS': 'CONVERSATIONS',
    'REACH': 'REACH', 
    'IMPRESSIONS': 'IMPRESSIONS',
    'CLICKS': 'LINK_CLICKS',
    'LINK_CLICKS': 'LINK_CLICKS',
    'LANDING_PAGE_VIEWS': 'LANDING_PAGE_VIEWS',
    'POST_ENGAGEMENT': 'POST_ENGAGEMENT',
    'PAGE_LIKES': 'PAGE_LIKES',
    'EVENT_RESPONSES': 'EVENT_RESPONSES',
    'MESSAGES': 'CONVERSATIONS',
    'LEADS': 'LEAD_GENERATION',
    'APP_INSTALLS': 'APP_INSTALLS',
    'PURCHASES': 'PURCHASE'
  };

  const optimizationGoal = csvRow['Optimization Goal'] && csvRow['Optimization Goal'].trim() ?
    optimizationGoalMap[csvRow['Optimization Goal']] || 'CONVERSATIONS' : 'CONVERSATIONS';

  // Map campaign objective with more comprehensive mapping
  const objectiveMap: { [key: string]: string } = {
    'Outcome Engagement': 'OUTCOME_ENGAGEMENT',
    'REACH': 'REACH',
    'TRAFFIC': 'OUTCOME_TRAFFIC', 
    'ENGAGEMENT': 'OUTCOME_ENGAGEMENT',
    'LEADS': 'OUTCOME_LEADS',
    'AWARENESS': 'OUTCOME_AWARENESS',
    'SALES': 'OUTCOME_SALES',
    'APP_PROMOTION': 'OUTCOME_APP_PROMOTION',
    'OUTCOME_ENGAGEMENT': 'OUTCOME_ENGAGEMENT',
    'OUTCOME_TRAFFIC': 'OUTCOME_TRAFFIC',
    'OUTCOME_LEADS': 'OUTCOME_LEADS'
  };

  const campaignObjective = csvRow['Campaign Objective'] && csvRow['Campaign Objective'].trim() ?
    objectiveMap[csvRow['Campaign Objective']] || 'OUTCOME_ENGAGEMENT' : 'OUTCOME_ENGAGEMENT';

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

  // Map call to action with more options and consider destination type
  const ctaMap: { [key: string]: string } = {
    'MESSAGE_PAGE': 'MESSAGE_PAGE',
    'LEARN_MORE': 'LEARN_MORE',
    'CONTACT_US': 'CONTACT_US',
    'CALL_NOW': 'CALL_NOW',
    'SHOP_NOW': 'SHOP_NOW',
    'SIGN_UP': 'SIGN_UP',
    'DOWNLOAD': 'DOWNLOAD',
    'BOOK_TRAVEL': 'BOOK_TRAVEL',
    'GET_QUOTE': 'GET_QUOTE',
    'APPLY_NOW': 'APPLY_NOW',
    'BOOK_NOW': 'BOOK_NOW',
    'SEE_MORE': 'LEARN_MORE',
    'WATCH_MORE': 'LEARN_MORE'
  };

  let callToAction = csvRow['Call to Action'] && csvRow['Call to Action'].trim() ?
    ctaMap[csvRow['Call to Action']] || 'LEARN_MORE' : 'LEARN_MORE';
  
  // Auto-adjust CTA for MESSENGER destination type
  if (destinationType === 'MESSENGER' && callToAction === 'LEARN_MORE') {
    callToAction = 'MESSAGE_PAGE';
  }

  // Parse daily budget - handle various formats and sources
  let dailyBudget = 50000; // Default budget in VND
  
  // Try Ad Set Daily Budget first, then Campaign Daily Budget
  const budgetSources = [csvRow['Ad Set Daily Budget'], csvRow['Campaign Daily Budget']];
  
  for (const budgetSource of budgetSources) {
    if (budgetSource && budgetSource.trim()) {
      const budgetStr = budgetSource.toString().replace(/[^\d]/g, '');
      const budget = parseInt(budgetStr);
      if (budget > 0) {
        dailyBudget = budget;
        break;
      }
    }
  }

  // Handle status mapping
  const status = (csvRow['Campaign Status'] === 'ACTIVE' || csvRow['Ad Set Run Status'] === 'ACTIVE') ? 'ACTIVE' : 'PAUSED';

  // Map bid strategy
  const bidStrategyMap: { [key: string]: string } = {
    'Highest volume or value': 'LOWEST_COST_WITHOUT_CAP',
    'LOWEST_COST_WITHOUT_CAP': 'LOWEST_COST_WITHOUT_CAP',
    'LOWEST_COST_WITH_BID_CAP': 'LOWEST_COST_WITH_BID_CAP',
    'TARGET_COST': 'TARGET_COST'
  };

  const bidStrategy = csvRow['Campaign Bid Strategy'] && csvRow['Campaign Bid Strategy'].trim() ?
    bidStrategyMap[csvRow['Campaign Bid Strategy']] || 'LOWEST_COST_WITHOUT_CAP' : 'LOWEST_COST_WITHOUT_CAP';

  const result = {
    name: csvRow['Campaign Name'] || 'Imported Campaign',
    campaign_objective: campaignObjective, // Use campaign_objective for the campaign
    objective: campaignObjective, // Keep objective for backwards compatibility
    status: status,
    daily_budget: dailyBudget,
    bid_strategy: bidStrategy,
    
    // Post ID from Permalink or Story ID
    post_id: postId,
    
    // Page ID (extracted from Permalink or will be set from form data)
    page_id: pageId, // Now extracted from Permalink
    
    // Ad Set data
    adset_name: csvRow['Ad Set Name'] || csvRow['Campaign Name'] + ' - Ad Set',
    optimization_goal: optimizationGoal,
    billing_event: csvRow['Billing Event'] === 'IMPRESSIONS' ? 'IMPRESSIONS' : 'LINK_CLICKS',
    destination_type: destinationType, // Use destination type from CSV
    
    // Set start_time to now if not provided in CSV
    start_time: new Date().toISOString(),
    
    // Set age range from targeting
    age_min: ageMin,
    age_max: ageMax,
    
    // Targeting
    targeting: {
      // Use custom location if available, otherwise use country targeting
      ...(hasCustomLocation ? {
        geo_locations: {
          custom_locations: [{
            latitude: latitude,
            longitude: longitude,
            radius: radius,
            distance_unit: 'kilometer'
          }]
        }
      } : countries.length > 0 ? {
        geo_locations: {
          countries: countries
        }
      } : {
        geo_locations: {
          countries: ['VN'] // Default to Vietnam
        }
      }),
      genders: genders,
      age_min: ageMin,
      age_max: ageMax,
      targeting_automation: {
        advantage_audience: advantageAudience
      }
      // Note: location_types is not supported by Facebook API, removed
    },
    
    // Creative
    ad_creative: {
      name: csvRow['Campaign Name'] + ' - Creative',
      object_story_spec: {
        page_id: '', // Will be set later
        link_data: {
          message: csvRow['Body'] && csvRow['Body'].trim() ? 
            csvRow['Body'] : 'Discover our amazing products and services!',
          call_to_action: {
            type: callToAction,
            value: {
              link: csvRow['Display Link'] && csvRow['Display Link'].trim() ? 
                csvRow['Display Link'] : 'https://facebook.com' // Use Display Link if available
            }
          }
        }
      }
    },
    
    // Ad data
    ad_name: csvRow['Ad Name'] || csvRow['Campaign Name'] + ' - Ad',
    
    // Additional metadata
    source: 'facebook_csv_import',
    original_data: csvRow
  };

  console.log('Mapped campaign data:', {
    name: result.name,
    objective: result.objective,
    campaign_objective: result.campaign_objective,
    dailyBudget: result.daily_budget,
    start_time: result.start_time,
    post_id: result.post_id,
    destination_type: result.destination_type,
    targeting: {
      location: hasCustomLocation ? 
        `${latitude}, ${longitude} +${radius}km` : 
        countries.length > 0 ? `Countries: ${countries.join(', ')}` : 'Default: VN',
      ageRange: `${ageMin}-${ageMax}`,
      genders: genders,
      advantageAudience: advantageAudience
    }
  });

  return result;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session from JWT
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const accountId = formData.get('accountId') as string;
    const accessToken = formData.get('accessToken') as string;
    const pageId = formData.get('pageId') as string;

    if (!file || !accountId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: file, accountId, or accessToken' },
        { status: 400 }
      );
    }

    // Read file as buffer first to detect encoding
    const fileBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(fileBuffer);
    
    // Try to detect encoding
    let csvText: string;
    let encoding = 'UTF-8';
    let encodingIssues: string[] = [];
    
    try {
      // First try UTF-8
      csvText = new TextDecoder('utf-8', { fatal: true }).decode(uint8Array);
    } catch (utf8Error) {
      try {
        // Try UTF-16LE
        csvText = new TextDecoder('utf-16le').decode(uint8Array);
        encoding = 'UTF-16LE';
        encodingIssues.push('UTF-16 encoding detected');
      } catch (utf16Error) {
        try {
          // Try Windows-1252
          csvText = new TextDecoder('windows-1252').decode(uint8Array);
          encoding = 'Windows-1252';
          encodingIssues.push('Windows-1252 encoding detected');
        } catch (winError) {
          // Fallback to UTF-8 with replacement
          csvText = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
          encodingIssues.push('Encoding detection failed, using UTF-8 with replacement');
        }
      }
    }
    
    // Clean up the text
    const originalLength = csvText.length;
    
    // Remove BOM if present
    if (csvText.charCodeAt(0) === 0xFEFF) {
      csvText = csvText.slice(1);
      encodingIssues.push('BOM removed');
    }
    
    // Handle null bytes and other control characters
    const nullByteCount = (csvText.match(/\0/g) || []).length;
    if (nullByteCount > 0) {
      csvText = csvText.replace(/\0/g, '');
      encodingIssues.push(`${nullByteCount} null bytes removed`);
    }
    
    // Remove other problematic control characters but keep tabs and newlines
    const controlCharsBefore = csvText.length;
    csvText = csvText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
    const controlCharsRemoved = controlCharsBefore - csvText.length;
    if (controlCharsRemoved > 0) {
      encodingIssues.push(`${controlCharsRemoved} control characters removed`);
    }
    
    // Detect delimiter - Facebook exports use tab delimiter
    const delimiter = csvText.includes('\t') ? '\t' : ',';
    
    console.log('Processing CSV file:', {
      detectedEncoding: encoding,
      encodingIssues: encodingIssues,
      originalLength: originalLength,
      cleanedLength: csvText.length,
      delimiter,
      firstLine: csvText.split('\n')[0]?.substring(0, 100)
    });
    
    const parseResult = Papa.parse(csvText, {
      header: true,
      delimiter: delimiter,
      skipEmptyLines: 'greedy',
      quoteChar: '"',
      escapeChar: '"',
      transformHeader: (header: string) => header.trim(),
      dynamicTyping: false, // Keep all values as strings
      newline: '\n'
    });

    // Filter out only critical parsing errors
    const criticalErrors = parseResult.errors.filter(error => 
      error.type === 'Delimiter' || 
      (error.type === 'FieldMismatch' && error.code === 'TooManyFields')
    );

    if (criticalErrors.length > 0) {
      console.error('Critical CSV parsing errors:', criticalErrors);
      return NextResponse.json(
        { error: 'Failed to parse CSV file - invalid format', details: criticalErrors },
        { status: 400 }
      );
    }

    const csvData = parseResult.data as FacebookCsvRow[];
    
    // Log parsing info for debugging
    console.log('CSV parsing completed:', {
      delimiter,
      totalRows: csvData.length,
      errorCount: parseResult.errors.length,
      headers: Object.keys(csvData[0] || {}),
      firstRowSample: csvData[0] ? Object.keys(csvData[0]).slice(0, 5) : [],
      sampleErrors: parseResult.errors.slice(0, 3)
    });
    
    if (csvData.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or contains no valid data' },
        { status: 400 }
      );
    }

    // Try to find campaign name field with different possible names
    const possibleCampaignFields = [
      'Campaign Name',
      'campaign name',
      'CAMPAIGN NAME',
      'Campaign_Name',
      'Name'
    ];

    let campaignFieldName = '';
    const firstRow = csvData[0];
    const availableFields = Object.keys(firstRow || {});
    
    // Find the campaign name field
    for (const field of possibleCampaignFields) {
      if (availableFields.includes(field)) {
        campaignFieldName = field;
        break;
      }
    }
    
    // If no exact match, try to find field containing "campaign" and "name"
    if (!campaignFieldName) {
      campaignFieldName = availableFields.find(field => 
        field.toLowerCase().includes('campaign') && field.toLowerCase().includes('name')
      ) || '';
    }
    
    console.log('Campaign field detection:', {
      foundField: campaignFieldName,
      availableFields: availableFields.slice(0, 10),
      totalFields: availableFields.length
    });

    // Filter out rows with missing essential data
    const validRows = csvData.filter(row => {
      if (!row || !campaignFieldName) return false;
      
      const campaignName = row[campaignFieldName];
      return campaignName && 
             typeof campaignName === 'string' && 
             campaignName.trim().length > 0;
    });

    console.log(`Filtered ${validRows.length} valid rows from ${csvData.length} total rows`);

    if (validRows.length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid campaign data found in CSV file',
          debug: {
            totalRows: csvData.length,
            campaignFieldFound: campaignFieldName,
            availableFields: Object.keys(csvData[0] || {}).slice(0, 10),
            sampleRow: csvData[0]
          }
        },
        { status: 400 }
      );
    }

    // Group by campaign name to avoid duplicates
    const uniqueCampaigns = new Map<string, any>();
    validRows.forEach(row => {
      const campaignName = row[campaignFieldName];
      if (campaignName && !uniqueCampaigns.has(campaignName)) {
        // Normalize the row to use standard field names
        const normalizedRow = normalizeFieldNames(row);
        uniqueCampaigns.set(campaignName, normalizedRow);
      }
    });

  // Convert CSV data to campaign format
  const campaigns = Array.from(uniqueCampaigns.values()).map(row => {
    const campaignData = mapFacebookCsvToCampaignData(row);
    
    // Set page ID - prioritize extracted from Permalink, then form input
    const extractedPageId = campaignData.page_id; // From Permalink
    const formPageId = pageId; // From form
    const effectivePageId = extractedPageId || formPageId; // Prioritize extracted
    
    if (effectivePageId) {
      campaignData.page_id = effectivePageId;
      if (campaignData.ad_creative?.object_story_spec) {
        campaignData.ad_creative.object_story_spec.page_id = effectivePageId;
      }
    }
    
    console.log(`Campaign "${campaignData.name}" - PageID: extracted=${extractedPageId}, form=${formPageId}, final=${effectivePageId}`);
    
    return campaignData;
  });

    console.log(`Successfully mapped ${campaigns.length} unique campaigns from ${validRows.length} valid rows`);

    // Validate access token
    const cleanToken = accessToken.trim();
    if (cleanToken.length < 50) {
      return NextResponse.json(
        { error: 'Invalid access token format' },
        { status: 400 }
      );
    }

    const results = [];
    const facebookApi = new FacebookAPI(cleanToken);

    // Test the token first
    try {
      const testResponse = await fetch(`https://graph.facebook.com/v23.0/me?access_token=${encodeURIComponent(cleanToken)}`);
      if (!testResponse.ok) {
        const testError = await testResponse.json();
        return NextResponse.json(
          { error: `Invalid access token: ${testError.error?.message || 'Token validation failed'}` },
          { status: 401 }
        );
      }
    } catch (tokenError) {
      return NextResponse.json(
        { error: `Token validation failed: ${tokenError}` },
        { status: 401 }
      );
    }

    // Create campaigns
    for (const campaignData of campaigns) {
      try {
        // Create log entry with pending status
        const log = await campaignLogService.createLog({
          name: campaignData.name,
          csvRow: campaignData.original_data,
          status: 'pending',
          account_id: accountId,
          user_id: session.user_id,
          daily_budget: campaignData.daily_budget
        });

        // Create full campaign
        const campaignResult = await createFullCampaign(
          facebookApi,
          accountId,
          campaignData,
          { page_id: pageId }
        );

        // Update log with success status
        await campaignLogService.updateLog(log._id!, {
          status: 'success',
          facebook_ids: {
            campaign_id: campaignResult.campaign_id,
            adset_id: campaignResult.adset_id,
            creative_id: campaignResult.creative_id,
            ad_id: campaignResult.ad_id
          }
        });

        results.push({
          name: campaignData.name,
          status: 'success',
          facebook_ids: campaignResult,
          log_id: log._id,
          facebook_urls: {
            campaign: `https://business.facebook.com/adsmanager/manage/campaigns/detail?campaign_id=${campaignResult.campaign_id}`,
            adset: `https://business.facebook.com/adsmanager/manage/adsets/detail?campaign_id=${campaignResult.campaign_id}&adset_id=${campaignResult.adset_id}`,
            ad: `https://business.facebook.com/adsmanager/manage/ads/detail?campaign_id=${campaignResult.campaign_id}&adset_id=${campaignResult.adset_id}&ad_id=${campaignResult.ad_id}`
          }
        });

      } catch (error: any) {
        console.error(`Error creating campaign ${campaignData.name}:`, error);

        // Update log with error status
        try {
          const logs = await campaignLogService.getLogsByStatus('pending', 10);
          const pendingLog = logs.find(log => log.name === campaignData.name);
          
          if (pendingLog) {
            await campaignLogService.updateLog(pendingLog._id!, {
              status: 'error',
              error_message: error.message
            });
          }
        } catch (logError) {
          console.error('Error updating log:', logError);
        }

        results.push({
          name: campaignData.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return NextResponse.json({ 
      results,
      totalProcessed: campaigns.length,
      successCount: results.filter(r => r.status === 'success').length,
      errorCount: results.filter(r => r.status === 'error').length
    });

  } catch (error: any) {
    console.error('Error in CSV import API:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
