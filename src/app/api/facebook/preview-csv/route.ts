import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import * as Papa from 'papaparse';

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

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
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
    
    // Detect delimiter
    const delimiter = csvText.includes('\t') ? '\t' : ',';
    
    // Parse the entire CSV first to handle multiline fields properly
    const parseResult = Papa.parse(csvText, {
      header: true,
      delimiter: delimiter,
      skipEmptyLines: 'greedy',
      quoteChar: '"',
      escapeChar: '"',
      transformHeader: (header: string) => header.trim(),
      // Handle newlines within quoted fields
      newline: '\n'
    });

    const data = parseResult.data as any[];
    const headers = Object.keys(data[0] || {});
    
    // Check for campaign-related fields
    const campaignFields = headers.filter(h => 
      h.toLowerCase().includes('campaign') || 
      h.toLowerCase().includes('name')
    );
    
    // Detect essential fields
    const essentialFields = {
      campaignName: headers.find(h => 
        h.toLowerCase().includes('campaign') && h.toLowerCase().includes('name')
      ),
      campaignStatus: headers.find(h => 
        h.toLowerCase().includes('campaign') && h.toLowerCase().includes('status')
      ),
      campaignObjective: headers.find(h => 
        h.toLowerCase().includes('campaign') && h.toLowerCase().includes('objective')
      ),
      budget: headers.find(h => 
        h.toLowerCase().includes('budget')
      ),
      targeting: headers.find(h => 
        h.toLowerCase().includes('address') || h.toLowerCase().includes('location')
      ),
      content: headers.find(h => 
        h.toLowerCase().includes('body') || h.toLowerCase().includes('message')
      )
    };

    return NextResponse.json({
      success: true,
      preview: {
        delimiter,
        totalHeaders: headers.length,
        headers: headers.slice(0, 20),
        campaignFields,
        essentialFields,
        sampleData: data.slice(0, 3),
        parseErrors: parseResult.errors.slice(0, 5),
        warnings: parseResult.errors.length > 0 ? 
          parseResult.errors.map(err => `${err.type}: ${err.message} (Row ${err.row})`) : [],
        encoding: {
          detectedEncoding: encoding,
          encodingIssues: encodingIssues,
          originalLength: originalLength,
          cleanedLength: csvText.length,
          hasIssues: encodingIssues.length > 0 || parseResult.errors.length > 0
        },
        stats: {
          totalRows: data.length,
          validRows: data.filter(row => row && Object.keys(row).some(key => row[key])).length,
          emptyRows: data.filter(row => !row || !Object.keys(row).some(key => row[key])).length
        }
      }
    });

  } catch (error: any) {
    console.error('Error in CSV preview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to preview CSV' },
      { status: 500 }
    );
  }
}
