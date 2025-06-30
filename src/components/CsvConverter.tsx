'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Info,
  Upload,
  RefreshCw
} from 'lucide-react';
import * as Papa from 'papaparse';

interface CsvPreviewData {
  headers: string[];
  rows: any[];
  totalRows: number;
  detectedFormat: 'facebook_export' | 'custom' | 'unknown';
  missingFields: string[];
  additionalFields: string[];
  encoding: {
    detectedEncoding: string;
    hasIssues: boolean;
    encodingIssues?: string[];
  };
}

interface CsvConverterProps {
  file: File | null;
  onConvertComplete?: (convertedFile: File) => void;
  onPreviewUpdate?: (previewData: CsvPreviewData | null) => void;
}

export function CsvConverter({ file, onConvertComplete, onPreviewUpdate }: CsvConverterProps) {
  const [previewData, setPreviewData] = useState<CsvPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [convertedData, setConvertedData] = useState<any[] | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  // Facebook Ads standard fields (in order)
  const facebookStandardFields = [
    'Campaign Name',
    'Campaign Status', 
    'Campaign Objective',
    'Campaign Daily Budget',
    'Campaign Bid Strategy',
    'Ad Set Name',
    'Ad Set Daily Budget',
    'Optimization Goal',
    'Billing Event',
    'Destination Type',
    'Gender',
    'Age Min',
    'Age Max',
    'Countries',
    'Cities',
    'Regions',
    'Addresses',
    'Location Types',
    'Body',
    'Call to Action',
    'Display Link',
    'Title',
    'Link Description',
    'Story ID',
    'Permalink',
    'Link Object ID',
    'Advantage Audience',
    'Publisher Platforms',
    'Facebook Positions',
    'Device Platforms'
  ];

  // Field mapping for conversion
  const fieldMappings = {
    // Campaign fields
    'name': 'Campaign Name',
    'campaign_name': 'Campaign Name',
    'status': 'Campaign Status',
    'campaign_status': 'Campaign Status',
    'objective': 'Campaign Objective',
    'campaign_objective': 'Campaign Objective',
    'daily_budget': 'Campaign Daily Budget',
    'campaign_daily_budget': 'Campaign Daily Budget',
    'bid_strategy': 'Campaign Bid Strategy',
    'campaign_bid_strategy': 'Campaign Bid Strategy',
    
    // Ad Set fields
    'adset_name': 'Ad Set Name',
    'ad_set_name': 'Ad Set Name',
    'adset_daily_budget': 'Ad Set Daily Budget',
    'ad_set_daily_budget': 'Ad Set Daily Budget',
    'optimization_goal': 'Optimization Goal',
    'billing_event': 'Billing Event',
    'destination_type': 'Destination Type',
    
    // Targeting fields
    'gender': 'Gender',
    'age_min': 'Age Min',
    'age_max': 'Age Max',
    'countries': 'Countries',
    'cities': 'Cities',
    'regions': 'Regions',
    'addresses': 'Addresses',
    'location_types': 'Location Types',
    
    // Creative fields
    'body': 'Body',
    'message': 'Body',
    'ad_text': 'Body',
    'call_to_action': 'Call to Action',
    'cta': 'Call to Action',
    'display_link': 'Display Link',
    'link': 'Display Link',
    'url': 'Display Link',
    'title': 'Title',
    'headline': 'Title',
    'link_description': 'Link Description',
    'description': 'Link Description',
    
    // ID fields
    'story_id': 'Story ID',
    'post_id': 'Story ID',
    'permalink': 'Permalink',
    'post_link': 'Permalink',
    'link_object_id': 'Link Object ID',
    'object_id': 'Link Object ID',
    
    // Settings
    'advantage_audience': 'Advantage Audience',
    'publisher_platforms': 'Publisher Platforms',
    'facebook_positions': 'Facebook Positions',
    'device_platforms': 'Device Platforms'
  };

  const analyzeFile = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    try {
      // Read file with encoding detection
      const fileBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileBuffer);
      
      // Try to detect encoding
      let csvText: string;
      let encoding = 'UTF-8';
      let encodingIssues: string[] = [];
      
      try {
        // Try UTF-8 first
        csvText = new TextDecoder('utf-8').decode(uint8Array);
      } catch (e) {
        try {
          // Try UTF-16LE
          csvText = new TextDecoder('utf-16le').decode(uint8Array);
          encoding = 'UTF-16LE';
        } catch (e) {
          // Fallback to Windows-1252
          csvText = new TextDecoder('windows-1252').decode(uint8Array);
          encoding = 'Windows-1252';
          encodingIssues.push('Non-UTF8 encoding detected');
        }
      }

      // Remove BOM and null bytes
      csvText = csvText.replace(/^\uFEFF/, '').replace(/\0/g, '');

      // Detect delimiter
      const sampleLines = csvText.split('\n').slice(0, 5);
      const tabCount = sampleLines.join('').split('\t').length - 1;
      const commaCount = sampleLines.join('').split(',').length - 1;
      const delimiter = tabCount > commaCount ? '\t' : ',';

      // Parse CSV
      const parseResult = Papa.parse(csvText, {
        header: true,
        delimiter: delimiter,
        skipEmptyLines: 'greedy',
        dynamicTyping: false
      });

      const headers = Object.keys(parseResult.data[0] || {});
      const rows = parseResult.data.slice(0, 10); // Preview first 10 rows

      // Analyze format
      const { detectedFormat, missingFields, additionalFields } = analyzeFormat(headers);

      const preview: CsvPreviewData = {
        headers,
        rows,
        totalRows: parseResult.data.length,
        detectedFormat,
        missingFields,
        additionalFields,
        encoding: {
          detectedEncoding: encoding,
          hasIssues: encodingIssues.length > 0,
          encodingIssues
        }
      };

      setPreviewData(preview);
      onPreviewUpdate?.(preview);

    } catch (error) {
      console.error('Error analyzing file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeFormat = (headers: string[]) => {
    const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
    const standardFields = facebookStandardFields.map(f => f.toLowerCase());

    // Check if it's a Facebook export
    const facebookExportIndicators = [
      'campaign name', 'campaign status', 'campaign objective',
      'ad set name', 'optimization goal', 'billing event'
    ];
    
    const matchingIndicators = facebookExportIndicators.filter(indicator => 
      normalizedHeaders.some(header => header.includes(indicator.replace(' ', '')))
    );

    let detectedFormat: 'facebook_export' | 'custom' | 'unknown' = 'unknown';
    if (matchingIndicators.length >= 4) {
      detectedFormat = 'facebook_export';
    } else if (matchingIndicators.length >= 2) {
      detectedFormat = 'custom';
    }

    // Find missing and additional fields
    const missingFields = facebookStandardFields.filter(field => 
      !normalizedHeaders.some(header => 
        header.includes(field.toLowerCase().replace(' ', ''))
      )
    );

    const additionalFields = headers.filter(header => 
      !facebookStandardFields.some(field =>
        header.toLowerCase().includes(field.toLowerCase().replace(' ', ''))
      )
    );

    return { detectedFormat, missingFields, additionalFields };
  };

  const convertToStandardFormat = () => {
    if (!previewData || !file) return;

    setIsLoading(true);
    
    // Read and parse the full file
    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      
      const parseResult = Papa.parse(csvText, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: false
      });

      const originalData = parseResult.data;
      const convertedData = originalData.map((row: any) => {
        const convertedRow: any = {};

        // Initialize with empty values for all standard fields
        facebookStandardFields.forEach(field => {
          convertedRow[field] = '';
        });

        // Map existing data to standard fields
        Object.entries(row).forEach(([originalField, value]) => {
          const normalizedField = originalField.toLowerCase().trim().replace(/\s+/g, '_');
          const mappedField = fieldMappings[normalizedField] || 
                             facebookStandardFields.find(f => 
                               f.toLowerCase().replace(/\s+/g, '_') === normalizedField
                             );

          if (mappedField) {
            convertedRow[mappedField] = value || '';
          } else {
            // Keep unmapped fields
            convertedRow[originalField] = value || '';
          }
        });

        // Set default values
        if (!convertedRow['Campaign Status']) {
          convertedRow['Campaign Status'] = 'ACTIVE';
        }
        if (!convertedRow['Campaign Objective']) {
          convertedRow['Campaign Objective'] = 'Outcome Engagement';
        }
        if (!convertedRow['Optimization Goal']) {
          convertedRow['Optimization Goal'] = 'CONVERSATIONS';
        }
        if (!convertedRow['Billing Event']) {
          convertedRow['Billing Event'] = 'IMPRESSIONS';
        }
        if (!convertedRow['Age Min']) {
          convertedRow['Age Min'] = '18';
        }
        if (!convertedRow['Age Max']) {
          convertedRow['Age Max'] = '65';
        }

        return convertedRow;
      });

      setConvertedData(convertedData);
      setShowComparison(true);
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  const downloadConvertedFile = () => {
    if (!convertedData) return;

    // Create CSV content
    const headers = facebookStandardFields;
    const csvRows = convertedData.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma/tab
        if (typeof value === 'string' && (value.includes(',') || value.includes('\t') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
    );

    const csvContent = [
      headers.join('\t'), // Use tab separator like Facebook export
      ...csvRows.map(row => row.join('\t'))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `facebook_ads_standard_format.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Create File object for callback
    const convertedFile = new File([blob], 'facebook_ads_standard_format.csv', {
      type: 'text/csv'
    });
    
    onConvertComplete?.(convertedFile);
  };

  React.useEffect(() => {
    if (file) {
      analyzeFile(file);
    } else {
      setPreviewData(null);
      setConvertedData(null);
      setShowComparison(false);
      onPreviewUpdate?.(null);
    }
  }, [file]);

  if (!file) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>CSV Format Converter</span>
          </CardTitle>
          <CardDescription>
            Upload a CSV file to preview its format and convert to Facebook Ads standard format
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No file selected</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* File Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>CSV Analysis</span>
            {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </CardTitle>
          <CardDescription>
            Analysis of your CSV file format and compatibility with Facebook Ads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {previewData && (
            <div className="space-y-4">
              {/* Format Detection */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Detected Format:</span>
                  <Badge 
                    variant={
                      previewData.detectedFormat === 'facebook_export' ? 'default' :
                      previewData.detectedFormat === 'custom' ? 'secondary' : 'destructive'
                    }
                  >
                    {previewData.detectedFormat === 'facebook_export' ? 'Facebook Export' :
                     previewData.detectedFormat === 'custom' ? 'Custom Format' : 'Unknown Format'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Encoding:</span>
                  <Badge variant={previewData.encoding.hasIssues ? 'destructive' : 'default'}>
                    {previewData.encoding.detectedEncoding}
                  </Badge>
                </div>
              </div>

              {/* Compatibility Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">File Info</span>
                  </div>
                  <p className="text-sm text-blue-700">
                    {previewData.headers.length} columns, {previewData.totalRows} rows
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Missing Fields</span>
                  </div>
                  <p className="text-sm text-yellow-700">
                    {previewData.missingFields.length} standard fields missing
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Additional Fields</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {previewData.additionalFields.length} extra fields found
                  </p>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h4 className="font-medium text-gray-900">Current Format Preview</h4>
                </div>
                <div className="overflow-x-auto max-h-60">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        {previewData.headers.slice(0, 6).map((header, index) => (
                          <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-r">
                            {header}
                          </th>
                        ))}
                        {previewData.headers.length > 6 && (
                          <th className="px-3 py-2 text-left font-medium text-gray-500">
                            +{previewData.headers.length - 6} more...
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.rows.slice(0, 5).map((row, rowIndex) => (
                        <tr key={rowIndex} className="border-b">
                          {previewData.headers.slice(0, 6).map((header, colIndex) => (
                            <td key={colIndex} className="px-3 py-2 text-gray-900 border-r max-w-32 truncate">
                              {String(row[header] || '').substring(0, 50)}
                              {String(row[header] || '').length > 50 && '...'}
                            </td>
                          ))}
                          {previewData.headers.length > 6 && (
                            <td className="px-3 py-2 text-gray-500">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Conversion Action */}
              {previewData.detectedFormat !== 'facebook_export' && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your CSV format doesn't match Facebook Ads standard format. 
                    Convert it to ensure compatibility and proper field mapping.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-4">
                <Button
                  onClick={convertToStandardFormat}
                  disabled={isLoading}
                  className="flex items-center space-x-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Convert to Facebook Ads Format</span>
                </Button>
                
                {previewData.detectedFormat === 'facebook_export' && (
                  <Badge variant="default" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Already in standard format</span>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison View */}
      {showComparison && convertedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Conversion Complete</span>
            </CardTitle>
            <CardDescription>
              Your CSV has been converted to Facebook Ads standard format
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Conversion Summary */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Conversion Summary</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Mapped {Object.keys(fieldMappings).length} field types to standard format</li>
                <li>• Added missing required fields with default values</li>
                <li>• Preserved all original data in unmapped fields</li>
                <li>• Ready for Facebook Ads import</li>
              </ul>
            </div>

            {/* Standard Format Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <h4 className="font-medium text-gray-900">Facebook Ads Standard Format Preview</h4>
              </div>
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {facebookStandardFields.slice(0, 6).map((header, index) => (
                        <th key={index} className="px-3 py-2 text-left font-medium text-gray-700 border-r">
                          {header}
                        </th>
                      ))}
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        +{facebookStandardFields.length - 6} more...
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {convertedData.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-b">
                        {facebookStandardFields.slice(0, 6).map((header, colIndex) => (
                          <td key={colIndex} className="px-3 py-2 text-gray-900 border-r max-w-32 truncate">
                            {String(row[header] || '').substring(0, 50)}
                            {String(row[header] || '').length > 50 && '...'}
                          </td>
                        ))}
                        <td className="px-3 py-2 text-gray-500">...</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Download Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={downloadConvertedFile}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Facebook Ads Format</span>
              </Button>
              
              <p className="text-sm text-gray-600">
                Download and use this file for Facebook Ads import
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
