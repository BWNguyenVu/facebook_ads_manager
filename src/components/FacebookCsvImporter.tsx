'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Facebook,
  AlertTriangle,
  Download,
  Info,
  ExternalLink,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { CsvConverter } from './CsvConverter';
import { CsvPreviewDialog } from './CsvPreviewDialog';
import { CampaignStatusButton } from './CampaignStatusButton';

interface ImportResult {
  name: string;
  status: 'success' | 'error';
  facebook_ids?: {
    campaign_id: string;
    adset_id: string;
    creative_id: string;
    ad_id: string;
  };
  facebook_urls?: {
    campaign: string;
    adset: string;
    ad: string;
  };
  error?: string;
  log_id?: string;
}

interface FacebookCsvImporterProps {
  accessToken: string;
  accountId: string;
  pageId?: string;
  onImportComplete?: (results: ImportResult[]) => void;
}

export function FacebookCsvImporter({ 
  accessToken, 
  accountId, 
  pageId,
  onImportComplete 
}: FacebookCsvImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState<ImportResult[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [preview, setPreview] = useState<any>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'convert' | 'import'>('upload');
  const [csvFormat, setCsvFormat] = useState<'standard' | 'custom'>('custom');
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [showQuickPreview, setShowQuickPreview] = useState(true);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles.length > 0) {
        setError('Please upload a valid CSV file');
        return;
      }
      
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setError('');
        setResults([]);
        setSuccess('');
        setPreview(null);
        
        // Auto-preview the file
        await previewFile(selectedFile);
      }
    }
  });

  const handleImport = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    if (!accessToken || !accountId) {
      setError('Missing access token or account ID');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('accessToken', accessToken);
      formData.append('accountId', accountId);
      if (pageId) {
        formData.append('pageId', pageId);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/facebook/import-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to import CSV');
      }

      const data = await response.json();
      setResults(data.results || []);
      
      const successCount = data.successCount || 0;
      const errorCount = data.errorCount || 0;
      const totalProcessed = data.totalProcessed || 0;

      if (successCount > 0) {
        setSuccess(`Successfully imported ${successCount} out of ${totalProcessed} campaigns`);
      }
      
      if (errorCount > 0) {
        setError(`${errorCount} campaigns failed to import. Check the results below for details.`);
      }

      // Call callback if provided
      if (onImportComplete) {
        onImportComplete(data.results);
      }

    } catch (error: any) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import CSV file');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setError('');
    setResults([]);
    setSuccess('');
    setPreview(null);
  };

  const downloadTemplate = () => {
    // Create a sample CSV with the expected headers matching Facebook export format
    const headers = [
      'Campaign Name',
      'Campaign Status', 
      'Campaign Objective',
      'Campaign Daily Budget',
      'Campaign Bid Strategy',
      'Ad Set Name',
      'Optimization Goal',
      'Billing Event',
      'Gender',
      'Age Min',
      'Age Max',
      'Addresses',
      'Location Types',
      'Body',
      'Call to Action',
      'Publisher Platforms',
      'Facebook Positions',
      'Device Platforms'
    ];
    
    const sampleRow = [
      'Sample Campaign',
      'ACTIVE',
      'Outcome Engagement',
      '99000',
      'Highest volume or value',
      'Sample Ad Set',
      'CONVERSATIONS',
      'IMPRESSIONS',
      '',
      '18',
      '65',
      '(10.7769, 106.7009) +25km',
      'home, recent',
      'Your amazing ad content goes here! 🎯 Contact us now for more information.',
      'LEARN_MORE',
      'facebook',
      'feed',
      'mobile'
    ];

    // Use tab delimiter to match Facebook export format
    const csvContent = [headers.join('\t'), sampleRow.join('\t')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'facebook_ads_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const previewFile = async (selectedFile: File) => {
    setIsLoadingPreview(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/facebook/preview-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to preview CSV');
      }
      
      const data = await response.json();
      setPreview(data.preview);
      
      // Check for potential issues
      const issues = [];
      const warnings = [];
      
      // Check encoding issues
      if (data.preview.encoding?.hasIssues) {
        warnings.push(`Encoding: ${data.preview.encoding.detectedEncoding}`);
        if (data.preview.encoding.encodingIssues?.length > 0) {
          warnings.push(...data.preview.encoding.encodingIssues);
        }
      }
      
      // Check essential fields
      if (!data.preview.essentialFields.campaignName) {
        issues.push('Campaign Name field not found');
      }
      
      // Check parsing errors
      if (data.preview.parseErrors?.length > 0) {
        console.log('Parse errors:', data.preview.parseErrors);
        warnings.push(`${data.preview.parseErrors.length} parsing issues detected`);
      }
      
      // Add specific warnings from API
      if (data.preview.warnings?.length > 0) {
        warnings.push(...data.preview.warnings);
      }
      
      // Set appropriate message
      if (issues.length > 0) {
        setError(`Critical issues: ${issues.join(', ')}`);
      } else if (warnings.length > 0) {
        setError(`Preview warnings: ${warnings.slice(0, 3).join('; ')}${warnings.length > 3 ? '...' : ''}`);
      }
      
    } catch (error: any) {
      console.error('Preview error:', error);
      setError(`Preview failed: ${error.message}`);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleConvertComplete = (convertedFile: File) => {
    setFile(convertedFile);
    setCsvFormat('standard');
    setActiveTab('import');
    // Auto-preview the converted file
    previewFile(convertedFile);
  };

  const handlePreviewUpdate = (previewData: any) => {
    if (previewData) {
      setCsvFormat(previewData.detectedFormat === 'facebook_export' ? 'standard' : 'custom');
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Facebook className="h-5 w-5 text-blue-600" />
            <span>Facebook Ads CSV Manager</span>
          </CardTitle>
          <CardDescription>
            Upload, preview, convert and import CSV files from Facebook Ads Manager. 
            Supports both standard Facebook exports and custom CSV formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Tabs for different stages */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload CSV</span>
              </TabsTrigger>
              <TabsTrigger 
                value="convert" 
                className={`flex items-center space-x-2 ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ArrowRight className="h-4 w-4" />
                <span>Preview & Convert</span>
              </TabsTrigger>
              <TabsTrigger 
                value="import" 
                className={`flex items-center space-x-2 ${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Facebook className="h-4 w-4" />
                <span>Import to Facebook</span>
              </TabsTrigger>
            </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            {/* Info Alert */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>How to export from Facebook Ads Manager:</strong><br />
                1. Go to Ads Manager → Campaigns/Ad Sets<br />
                2. Select the data you want to export<br />
                3. Click "Export" → "Export table data"<br />
                4. Choose CSV format and download<br />
                5. Upload the file here to preview and import<br />
              </AlertDescription>
            </Alert>

            {/* Template Download */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Need a template?</h4>
                <p className="text-sm text-gray-600">Download a sample CSV file to see the expected format</p>
              </div>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Template</span>
              </Button>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <Label htmlFor="csv-upload">CSV File</Label>
              
              <div
                {...getRootProps()}
                className={`
                  border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                  ${file ? 'border-green-400 bg-green-50' : ''}
                `}
              >
                <input {...getInputProps()} />
                
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                    <p className="text-sm font-medium text-green-700">{file.name}</p>
                    <p className="text-xs text-green-600">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                    <div className="flex space-x-2 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPreviewDialog(true);
                        }}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Preview</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('convert');
                        }}
                      >
                        Convert
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">
                      {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file here, or click to select'}
                    </p>
                    <p className="text-xs text-gray-500">CSV files only</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick File Preview */}
            {file && preview && showQuickPreview && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-blue-900">Quick Preview</h4>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPreviewDialog(true)}
                      className="text-blue-700 hover:text-blue-900 hover:bg-blue-100"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Detailed View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowQuickPreview(false)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-sm text-blue-600">Format</div>
                    <div className="font-medium text-blue-900">
                      {preview.delimiter === '\t' ? 'Tab-separated' : 'Comma-separated'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-blue-600">Columns</div>
                    <div className="font-medium text-blue-900">{preview.totalHeaders}</div>
                  </div>
                  {preview.stats && (
                    <>
                      <div className="text-center">
                        <div className="text-sm text-blue-600">Rows</div>
                        <div className="font-medium text-blue-900">{preview.stats.totalRows}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-blue-600">Valid</div>
                        <div className="font-medium text-blue-900">{preview.stats.validRows}</div>
                      </div>
                    </>
                  )}
                </div>

                {/* Compatibility indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {Object.values(preview.essentialFields).filter(Boolean).length >= Object.keys(preview.essentialFields).length * 0.7 ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">Compatible with Facebook Ads</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">May need conversion</span>
                      </>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('convert')}
                      className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      Convert
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setActiveTab('import')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Import
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Convert Tab */}
          <TabsContent value="convert" className="space-y-6">
            <CsvConverter 
              file={file} 
              onConvertComplete={handleConvertComplete}
              onPreviewUpdate={handlePreviewUpdate}
            />
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-6">
            {/* Configuration Check */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {accessToken ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Access Token: {accessToken ? 'Configured' : 'Missing'}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                {accountId ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm">Account ID: {accountId ? 'Configured' : 'Missing'}</span>
              </div>

              <div className="flex items-center space-x-2">
                {pageId ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm">Page ID: {pageId ? 'Configured' : 'Optional (will use default)'}</span>
              </div>
            </div>

            {/* File Status */}
            {file && (
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>File ready:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  {csvFormat === 'standard' && (
                    <span className="text-green-600 ml-2">✓ Standard format</span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Importing campaigns...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Import Button */}
            <Button
              onClick={handleImport}
              disabled={!file || !accessToken || !accountId || isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV to Facebook Ads
                </>
              )}
            </Button>

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Import Results</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {results.map((result, index) => (
                    <div
                      key={index}
                      className={`
                        p-3 rounded-lg border
                        ${result.status === 'success' 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-red-200 bg-red-50'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-2">
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium text-sm">{result.name}</span>
                      </div>
                      
                      {result.status === 'success' && result.facebook_ids && (
                        <div className="mt-2 space-y-3">
                          <div className="text-xs text-green-700">
                            <p>Campaign ID: {result.facebook_ids.campaign_id}</p>
                            <p>Ad Set ID: {result.facebook_ids.adset_id}</p>
                          </div>

                          {/* Campaign Status Control */}
                          <div className="border-t border-green-200 pt-2">
                            <p className="text-xs text-green-700 font-medium mb-2">Campaign Control:</p>
                            <CampaignStatusButton
                              campaignId={result.facebook_ids.campaign_id}
                              currentStatus="PAUSED" // Default status after creation
                              accessToken={accessToken}
                              size="sm"
                              onStatusUpdate={(newStatus) => {
                                console.log(`Campaign ${result.facebook_ids!.campaign_id} status updated to ${newStatus}`);
                              }}
                            />
                          </div>
                          
                          {/* Redirect Buttons */}
                          {result.facebook_urls && (
                            <div className="space-y-2 border-t border-green-200 pt-2">
                              <p className="text-xs text-green-700 font-medium">
                                ✅ Campaign created successfully! You can now view it on Facebook:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-green-300 text-green-700 hover:bg-green-100"
                                  onClick={() => window.open(result.facebook_urls!.campaign, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Open Campaign
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-green-300 text-green-700 hover:bg-green-100"
                                  onClick={() => window.open(result.facebook_urls!.adset, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Open Ad Set
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-green-300 text-green-700 hover:bg-green-100"
                                  onClick={() => window.open(result.facebook_urls!.ad, '_blank')}
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Open Ad
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {result.status === 'error' && result.error && (
                        <p className="mt-1 text-xs text-red-700">{result.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CSV Preview */}
            {preview && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-800 text-sm">CSV File Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-semibold text-blue-800 mb-2">File Info</h5>
                      <div className="space-y-1 text-blue-700">
                        <p>Delimiter: <code className="bg-blue-100 px-1 rounded">{preview.delimiter === '\t' ? 'Tab' : 'Comma'}</code></p>
                        <p>Headers: {preview.totalHeaders}</p>
                        {preview.stats && (
                          <>
                            <p>Rows: {preview.stats.totalRows} ({preview.stats.validRows} valid, {preview.stats.emptyRows} empty)</p>
                          </>
                        )}
                        <div>
                          <p>Encoding: <code className="bg-blue-100 px-1 rounded">{preview.encoding?.detectedEncoding || 'UTF-8'}</code></p>
                          {preview.encoding?.hasIssues && preview.encoding?.encodingIssues && (
                            <div className="mt-1">
                              <p className="text-orange-600 text-xs">Fixed issues:</p>
                              <ul className="text-orange-600 text-xs ml-2">
                                {preview.encoding.encodingIssues.map((issue: string, index: number) => (
                                  <li key={index}>• {issue}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        {preview.parseErrors && preview.parseErrors.length > 0 && (
                          <div className="mt-2">
                            <p className="text-amber-600 text-xs">Parsing issues:</p>
                            <ul className="text-amber-600 text-xs ml-2">
                              {preview.parseErrors.slice(0, 3).map((error: any, index: number) => (
                                <li key={index}>• {error.type}: {error.message} {error.row && `(Row ${error.row})`}</li>
                              ))}
                              {preview.parseErrors.length > 3 && <li>• ... and {preview.parseErrors.length - 3} more</li>}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-blue-800 mb-2">Essential Fields</h5>
                      <div className="space-y-1 text-blue-700">
                        {Object.entries(preview.essentialFields).map(([key, value]) => (
                          <div key={key} className="flex items-center space-x-2">
                            {value ? (
                              <CheckCircle className="h-3 w-3 text-green-600" />
                            ) : (
                              <XCircle className="h-3 w-3 text-red-600" />
                            )}
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: {String(value || 'Not found')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {preview.sampleData && preview.sampleData.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-blue-800 mb-2">Sample Data</h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-blue-100">
                              {Object.keys(preview.sampleData[0]).slice(0, 6).map(header => (
                                <th key={header} className="border border-blue-200 px-2 py-1 text-left">
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {preview.sampleData.slice(0, 2).map((row: any, index: number) => (
                              <tr key={index} className="bg-white">
                                {Object.values(row).slice(0, 6).map((value: any, i: number) => (
                                  <td key={i} className="border border-blue-200 px-2 py-1">
                                    {String(value).substring(0, 50)}
                                    {String(value).length > 50 ? '...' : ''}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Loading Preview */}
            {isLoadingPreview && (
              <Card className="bg-gray-50">
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                    <p className="text-gray-600">Analyzing CSV file...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          </Tabs>
        </CardContent>
      </Card>

      {/* CSV Preview Dialog */}
      <CsvPreviewDialog
        open={showPreviewDialog}
        onOpenChange={setShowPreviewDialog}
        preview={preview}
        fileName={file?.name || 'CSV File'}
        onConvert={() => {
          setShowPreviewDialog(false);
          setActiveTab('convert');
        }}
        onImport={() => {
          setShowPreviewDialog(false);
          setActiveTab('import');
        }}
        isConverted={csvFormat === 'standard'}
      />
    </>
  );
}
