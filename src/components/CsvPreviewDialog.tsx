'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Download,
  ArrowRight
} from 'lucide-react';

interface CsvPreviewData {
  delimiter: string;
  totalHeaders: number;
  stats?: {
    totalRows: number;
    validRows: number;
    emptyRows: number;
  };
  encoding?: {
    detectedEncoding: string;
    hasIssues: boolean;
    encodingIssues?: string[];
  };
  essentialFields: Record<string, boolean>;
  sampleData?: any[];
  parseErrors?: any[];
  warnings?: string[];
}

interface CsvPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preview: CsvPreviewData | null;
  fileName: string;
  onConvert?: () => void;
  onImport?: () => void;
  isConverted?: boolean;
}

export function CsvPreviewDialog({
  open,
  onOpenChange,
  preview,
  fileName,
  onConvert,
  onImport,
  isConverted = false
}: CsvPreviewDialogProps) {
  if (!preview) return null;

  const getFormatBadge = () => {
    const essentialFieldsCount = Object.values(preview.essentialFields).filter(Boolean).length;
    const totalEssentialFields = Object.keys(preview.essentialFields).length;
    
    if (essentialFieldsCount >= totalEssentialFields * 0.8) {
      return (
        <Badge variant="default" className="flex items-center space-x-1">
          <CheckCircle className="h-3 w-3" />
          <span>Facebook Export Format</span>
        </Badge>
      );
    } else if (essentialFieldsCount >= totalEssentialFields * 0.5) {
      return (
        <Badge variant="secondary" className="flex items-center space-x-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Partial Compatibility</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="flex items-center space-x-1">
          <XCircle className="h-3 w-3" />
          <span>Custom Format</span>
        </Badge>
      );
    }
  };

  const getCompatibilityScore = () => {
    const essentialFieldsCount = Object.values(preview.essentialFields).filter(Boolean).length;
    const totalEssentialFields = Object.keys(preview.essentialFields).length;
    return Math.round((essentialFieldsCount / totalEssentialFields) * 100);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>CSV File Preview</span>
            {isConverted && (
              <Badge variant="default" className="ml-2">
                <CheckCircle className="h-3 w-3 mr-1" />
                Converted
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Analysis and preview of {fileName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Format Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Format Analysis</CardTitle>
              <CardDescription>
                Compatibility analysis with Facebook Ads format requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Format Badge and Score */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getFormatBadge()}
                  <div className="text-sm text-gray-600">
                    Compatibility: {getCompatibilityScore()}%
                  </div>
                </div>
                {!isConverted && getCompatibilityScore() < 80 && onConvert && (
                  <Button 
                    onClick={onConvert}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    <span>Convert to Standard Format</span>
                  </Button>
                )}
              </div>

              {/* File Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-blue-900">Delimiter</div>
                  <div className="text-lg font-bold text-blue-700">
                    {preview.delimiter === '\t' ? 'Tab' : 'Comma'}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm font-medium text-green-900">Headers</div>
                  <div className="text-lg font-bold text-green-700">
                    {preview.totalHeaders}
                  </div>
                </div>
                {preview.stats && (
                  <>
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-purple-900">Total Rows</div>
                      <div className="text-lg font-bold text-purple-700">
                        {preview.stats.totalRows}
                      </div>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-orange-900">Valid Rows</div>
                      <div className="text-lg font-bold text-orange-700">
                        {preview.stats.validRows}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Encoding Information */}
              {preview.encoding && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Encoding:</span>
                    <Badge variant={preview.encoding.hasIssues ? 'destructive' : 'default'}>
                      {preview.encoding.detectedEncoding}
                    </Badge>
                  </div>
                  {preview.encoding.hasIssues && preview.encoding.encodingIssues && (
                    <div className="text-sm text-orange-600">
                      Issues: {preview.encoding.encodingIssues.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* Parsing Errors/Warnings */}
              {preview.parseErrors && preview.parseErrors.length > 0 && (
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">
                      Parsing Issues ({preview.parseErrors.length})
                    </span>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {preview.parseErrors.slice(0, 3).map((error: any, index: number) => (
                      <li key={index}>
                        • {error.type}: {error.message} {error.row && `(Row ${error.row})`}
                      </li>
                    ))}
                    {preview.parseErrors.length > 3 && (
                      <li>• ... and {preview.parseErrors.length - 3} more issues</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Essential Fields Check */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Field Compatibility</CardTitle>
              <CardDescription>
                Check for essential Facebook Ads fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(preview.essentialFields).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    {value ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${value ? 'text-green-700' : 'text-red-700'}`}>
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sample Data Preview */}
          {preview.sampleData && preview.sampleData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Data Preview</CardTitle>
                <CardDescription>
                  Sample data from your CSV file (first few rows and columns)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(preview.sampleData[0]).slice(0, 8).map(header => (
                          <th key={header} className="px-3 py-2 text-left font-medium text-gray-700 border-r">
                            {header}
                          </th>
                        ))}
                        {Object.keys(preview.sampleData[0]).length > 8 && (
                          <th className="px-3 py-2 text-left font-medium text-gray-500">
                            +{Object.keys(preview.sampleData[0]).length - 8} more...
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sampleData.slice(0, 5).map((row: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          {Object.values(row).slice(0, 8).map((value: any, i: number) => (
                            <td key={i} className="px-3 py-2 text-gray-900 border-r max-w-32">
                              <div className="truncate" title={String(value)}>
                                {String(value).substring(0, 50)}
                                {String(value).length > 50 ? '...' : ''}
                              </div>
                            </td>
                          ))}
                          {Object.values(row).length > 8 && (
                            <td className="px-3 py-2 text-gray-500">...</td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              {isConverted ? (
                <span className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>File is ready for Facebook Ads import</span>
                </span>
              ) : (
                <span>
                  {getCompatibilityScore()}% compatible with Facebook Ads format
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              {!isConverted && getCompatibilityScore() < 80 && onConvert && (
                <Button 
                  onClick={onConvert}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>Convert Format</span>
                </Button>
              )}
              {onImport && (
                <Button 
                  onClick={onImport}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Import to Facebook</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
