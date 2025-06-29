import Papa from 'papaparse';
import { CampaignData } from '@/types/facebook';
import { autoMapFacebookEnums, validateFacebookEnums } from '@/lib/utils';

export interface CSVParseResult {
  data: CampaignData[];
  errors: string[];
  meta: {
    fields: string[];
    rowCount: number;
  };
}

// Các trường bắt buộc trong CSV
const REQUIRED_FIELDS = [
  'name',
  'page_id',
  'post_id',
  'daily_budget',
  'age_min',
  'age_max',
  'start_time'
];

// Chuyển đổi scientific notation thành string ID với độ chính xác cao
function parseIdField(value: any): string {
  if (!value) return '';
  
  // Remove quotes and Excel formula prefix if present
  let cleanValue = value.toString().replace(/['"]/g, '').replace(/^=/, '').trim();
  
  // Check if it's in scientific notation (contains E or e)
  if (/[eE]/.test(cleanValue)) {
    try {
      // Convert using BigInt for precision with large numbers
      const parts = cleanValue.toLowerCase().split('e');
      if (parts.length === 2) {
        const base = parts[0];
        const exponent = parseInt(parts[1]);
        
        // Remove decimal point
        const baseDigits = base.replace('.', '');
        const decimalPlaces = base.includes('.') ? base.split('.')[1].length : 0;
        
        // Calculate how many zeros to add or remove
        const zerosToAdd = exponent - decimalPlaces;
        
        if (zerosToAdd >= 0) {
          // Add zeros
          const result = baseDigits + '0'.repeat(zerosToAdd);
          return result;
        } else {
          // This shouldn't happen with Facebook IDs, but handle it
          return cleanValue;
        }
      }
    } catch (e) {
      console.error('Error parsing scientific notation:', e);
    }
  }
  
  return cleanValue;
}

// Validate một dòng dữ liệu
function validateRow(row: any, index: number): string[] {
  const errors: string[] = [];

  // Kiểm tra các trường bắt buộc
  REQUIRED_FIELDS.forEach(field => {
    if (!row[field] || row[field].toString().trim() === '') {
      errors.push(`Row ${index + 1}: Missing required field "${field}"`);
    }
  });

  // Validate ID fields (page_id, post_id, account_id)
  if (row.page_id) {
    const originalPageId = row.page_id.toString();
    const pageId = parseIdField(row.page_id);
    console.log(`Row ${index + 1} - Original page_id:`, originalPageId, '-> Parsed:', pageId);
    
    // Check for scientific notation in original value
    if (originalPageId.includes('E') || originalPageId.includes('e')) {
      errors.push(`Row ${index + 1}: page_id contains scientific notation "${originalPageId}". Please format the column as TEXT in Excel/Google Sheets before entering data.`);
    }
    
    if (!/^\d+$/.test(pageId) || pageId.length < 10) {
      errors.push(`Row ${index + 1}: page_id "${pageId}" is invalid (original: "${originalPageId}")`);
    }
  }

  if (row.post_id) {
    const originalPostId = row.post_id.toString();
    const postId = parseIdField(row.post_id);
    console.log(`Row ${index + 1} - Original post_id:`, originalPostId, '-> Parsed:', postId);
    
    // Check for scientific notation in original value
    if (originalPostId.includes('E') || originalPostId.includes('e')) {
      errors.push(`Row ${index + 1}: post_id contains scientific notation "${originalPostId}". Please format the column as TEXT in Excel/Google Sheets before entering data.`);
    }
    
    if (!/^\d+$/.test(postId) || postId.length < 10) {
      errors.push(`Row ${index + 1}: post_id "${postId}" is invalid (original: "${originalPostId}")`);
    }
  }

  if (row.account_id) {
    const originalAccountId = row.account_id.toString();
    const accountId = parseIdField(row.account_id);
    console.log(`Row ${index + 1} - Original account_id:`, originalAccountId, '-> Parsed:', accountId);
    
    // Check for scientific notation in original value
    if (originalAccountId.includes('E') || originalAccountId.includes('e')) {
      errors.push(`Row ${index + 1}: account_id contains scientific notation "${originalAccountId}". Please format the column as TEXT in Excel/Google Sheets before entering data.`);
    }
    
    if (!/^\d+$/.test(accountId) || accountId.length < 10) {
      errors.push(`Row ${index + 1}: account_id "${accountId}" is invalid (original: "${originalAccountId}")`);
    }
  }

  // Validate daily_budget
  if (row.daily_budget && isNaN(Number(row.daily_budget))) {
    errors.push(`Row ${index + 1}: daily_budget must be a number`);
  }

  // Validate minimum budget (Facebook requires minimum ~26,251 VND ≈ $1 USD)
  if (row.daily_budget && Number(row.daily_budget) < 30000) {
    errors.push(`Row ${index + 1}: daily_budget must be at least 30,000 VND ($1.2 USD minimum for Facebook)`);
  }

  // Validate age_min, age_max
  if (row.age_min && (isNaN(Number(row.age_min)) || Number(row.age_min) < 13)) {
    errors.push(`Row ${index + 1}: age_min must be a number >= 13`);
  }

  if (row.age_max && (isNaN(Number(row.age_max)) || Number(row.age_max) > 65)) {
    errors.push(`Row ${index + 1}: age_max must be a number <= 65`);
  }

  if (row.age_min && row.age_max && Number(row.age_min) > Number(row.age_max)) {
    errors.push(`Row ${index + 1}: age_min cannot be greater than age_max`);
  }

  // Validate start_time format
  if (row.start_time && !isValidDateFormat(row.start_time)) {
    errors.push(`Row ${index + 1}: start_time must be in format YYYY-MM-DDTHH:mm:ss-HHMM or YYYY-MM-DD HH:mm:ss`);
  }

  // Validate end_time format (optional)
  if (row.end_time && row.end_time.trim() !== '' && !isValidDateFormat(row.end_time)) {
    errors.push(`Row ${index + 1}: end_time must be in format YYYY-MM-DDTHH:mm:ss-HHMM or YYYY-MM-DD HH:mm:ss`);
  }

  return errors;
}

// Kiểm tra format ngày tháng
function isValidDateFormat(dateString: string): boolean {
  // ISO format: 2025-07-01T00:00:00-0700
  // Simple format: 2025-07-01 00:00:00
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4}$/;
  const simpleRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  
  if (isoRegex.test(dateString) || simpleRegex.test(dateString)) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  
  return false;
}

// Chuẩn hóa format ngày tháng
function normalizeDateTime(dateString: string): string {
  if (!dateString || dateString.trim() === '') return '';
  
  // Nếu đã đúng format ISO, return luôn
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4}$/.test(dateString)) {
    return dateString;
  }
  
  // Convert simple format to ISO
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(dateString)) {
    return dateString.replace(' ', 'T') + '+0700'; // Default timezone
  }
  
  return dateString;
}

// Parse CSV file
export function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    // Determine delimiter based on file extension
    const delimiter = file.name.endsWith('.txt') ? '\t' : ',';
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: delimiter,
      complete: (results) => {
        const errors: string[] = [];
        const validData: CampaignData[] = [];

        // Kiểm tra có dữ liệu không
        if (!results.data || results.data.length === 0) {
          errors.push('CSV file is empty or has no valid data');
          resolve({
            data: [],
            errors,
            meta: {
              fields: [],
              rowCount: 0
            }
          });
          return;
        }

        // Kiểm tra header có đủ trường bắt buộc không
        const fields = results.meta.fields || [];
        const missingFields = REQUIRED_FIELDS.filter(field => !fields.includes(field));
        if (missingFields.length > 0) {
          errors.push(`Missing required columns: ${missingFields.join(', ')}`);
        }

        // Validate từng dòng
        results.data.forEach((row: any, index: number) => {
          const rowErrors = validateRow(row, index);
          errors.push(...rowErrors);

          // Nếu dòng này không có lỗi, thêm vào validData
          if (rowErrors.length === 0) {
            // Tạo campaignData cơ bản
            const rawCampaignData: CampaignData = {
              name: row.name.trim(),
              page_id: parseIdField(row.page_id),
              post_id: parseIdField(row.post_id),
              daily_budget: Number(row.daily_budget),
              age_min: Number(row.age_min),
              age_max: Number(row.age_max),
              start_time: normalizeDateTime(row.start_time.trim()),
              end_time: row.end_time ? normalizeDateTime(row.end_time.trim()) : undefined,
              account_id: row.account_id ? parseIdField(row.account_id) : undefined
            };

            // Thêm các trường enum tùy chọn nếu có trong CSV
            if (row.campaign_objective) {
              (rawCampaignData as any).campaign_objective = row.campaign_objective.trim();
            }
            if (row.optimization_goal) {
              (rawCampaignData as any).optimization_goal = row.optimization_goal.trim();
            }
            if (row.bid_strategy) {
              (rawCampaignData as any).bid_strategy = row.bid_strategy.trim();
            }
            if (row.billing_event) {
              (rawCampaignData as any).billing_event = row.billing_event.trim();
            }

            // Auto-map Facebook enums (convert human readable to API format)
            const mappedCampaignData = autoMapFacebookEnums(rawCampaignData);
            
            // Validate enum values after mapping
            const enumValidation = validateFacebookEnums(mappedCampaignData);
            if (!enumValidation.isValid) {
              errors.push(`Row ${index + 1}: ${enumValidation.errors.join(', ')}`);
            } else {
              validData.push(mappedCampaignData);
            }
          }
        });

        resolve({
          data: validData,
          errors,
          meta: {
            fields,
            rowCount: results.data.length
          }
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [`Failed to parse CSV: ${error.message}`],
          meta: {
            fields: [],
            rowCount: 0
          }
        });
      }
    });
  });
}

// Tạo template CSV
export function generateCSVTemplate(): string {
  const headers = [
    'name',
    'page_id',
    'post_id',
    'daily_budget',
    'age_min',
    'age_max',
    'start_time',
    'end_time',
    'account_id',
    'campaign_objective',
    'optimization_goal',
    'bid_strategy',
    'billing_event',
    'destination_type'
  ];

  const sampleData = [
    'Campaign Test',
    '="104882489141131"',  // Excel formula to force text format
    '="724361597203916"',  // Excel formula to force text format
    '50000',               // Budget in VND
    '18',
    '45', 
    '2025-07-01T00:00:00+0700',
    '2025-07-10T00:00:00+0700',
    '="568800062218281"',   // Excel formula to force text format
    'Outcome Engagement',   // Human readable - will auto-convert to OUTCOME_ENGAGEMENT
    'Post Engagement',      // Human readable - will auto-convert to POST_ENGAGEMENT  
    'Automatic',            // Human readable - will auto-convert to LOWEST_COST_WITHOUT_CAP
    'Impressions',          // Human readable - will auto-convert to IMPRESSIONS
    'On Post'               // Human readable - will auto-convert to ON_POST (destination_type)
  ];

  return `${headers.join(',')}\n${sampleData.join(',')}`;
}

// Download CSV template
export function downloadCSVTemplate() {
  const csvContent = generateCSVTemplate();
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'facebook_campaign_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Download TXT template (tab-separated, Excel-friendly)
export function downloadTXTTemplate() {
  const headers = [
    'name',
    'page_id',
    'post_id',
    'daily_budget',
    'age_min',
    'age_max',
    'start_time',
    'end_time',
    'account_id',
    'campaign_objective',
    'optimization_goal',
    'bid_strategy',
    'billing_event',
    'destination_type'
  ];

  const sampleData = [
    'Campaign Test',
    '104882489141131',     // Plain text, no quotes
    '724361597203916',     // Plain text, no quotes
    '50000',
    '18',
    '45',
    '2025-07-01T00:00:00+0700',
    '2025-07-10T00:00:00+0700',
    '0',                   // Will be ignored, auto-filled from settings
    'Outcome Engagement',  // Human readable
    'Post Engagement',     // Human readable
    'Automatic',           // Human readable - will map to LOWEST_COST_WITHOUT_CAP
    'Impressions',         // Human readable
    'On Post'              // Human readable - will map to ON_POST
  ];

  const txtContent = `${headers.join('\t')}\n${sampleData.join('\t')}`;
  const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'facebook_campaign_template.txt');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Test function for debugging (remove in production)
export function testParseIdField() {
  const testCases = [
    '1.04882E+14',  // Should become 104882000000000
    '7.24362E+14',  // Should become 724362000000000
    '5.688E+14',    // Should become 568800000000000
    '104882489141131', // Should stay same
    '724361597203916'  // Should stay same
  ];
  
  console.log('Testing parseIdField function:');
  testCases.forEach(test => {
    const result = parseIdField(test);
    console.log(`${test} -> ${result}`);
  });
}
