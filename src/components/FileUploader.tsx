'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Download, AlertCircle } from 'lucide-react';
import { parseCSV, downloadCSVTemplate, downloadTXTTemplate, CSVParseResult } from '@/lib/csvParser';
import { CampaignData } from '@/types/facebook';

interface FileUploaderProps {
  onDataParsed: (data: CampaignData[], errors: string[]) => void;
}

export function FileUploader({ onDataParsed }: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      alert('Please upload a CSV or TXT file');
      return;
    }

    setIsUploading(true);
    try {
      const result = await parseCSV(file);
      setParseResult(result);
      onDataParsed(result.data, result.errors);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file');
    } finally {
      setIsUploading(false);
    }
  }, [onDataParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  return (
    <div className="w-full space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 lg:p-8">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Upload className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Upload Campaign Data
            </h1>
            <p className="text-sm lg:text-base text-gray-500 mt-1">
              Upload your campaign data in CSV format to get started
            </p>
          </div>
        </div>
      </div>

      {/* Template Download */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Download className="h-5 w-5 text-white" />
            </div>
            <span>CSV Template</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Download the CSV template to get started with the correct format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={downloadCSVTemplate} 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 rounded-xl px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-200 flex-1 sm:flex-none"
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV Template
            </Button>
            <Button 
              onClick={downloadTXTTemplate} 
              variant="outline" 
              className="border-gray-200/50 hover:bg-gray-50/50 rounded-xl px-4 py-3 transition-all duration-200 flex-1 sm:flex-none"
            >
              <FileText className="h-4 w-4 mr-2" />
              Download TXT Template
            </Button>
          </div>
          <div className="bg-blue-50/50 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30">
            <p className="text-sm text-blue-700 font-medium flex items-start">
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
              TXT template is recommended for Excel users to avoid automatic number formatting issues
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Upload className="h-5 w-5 text-white" />
            </div>
            <span>Upload CSV File</span>
          </CardTitle>
          <CardDescription className="text-gray-600">
            Upload your campaign data in CSV or TXT format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-8 lg:p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive 
                ? 'border-blue-400 bg-blue-50/50 backdrop-blur-sm scale-[1.02]' 
                : 'border-gray-300/50 hover:border-blue-400/50 hover:bg-blue-50/30'
            } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          >
            <input {...getInputProps()} disabled={isUploading} />
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            
            {isUploading ? (
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-gray-600 font-medium">Processing file...</p>
                <p className="text-sm text-gray-500 mt-1">Please wait while we parse your data</p>
              </div>
            ) : isDragActive ? (
              <div className="text-center">
                <p className="text-blue-600 font-semibold text-lg mb-2">Drop the CSV file here!</p>
                <p className="text-sm text-blue-500">Release to upload your campaign data</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-700 font-semibold text-lg mb-3">
                  Drag & drop a CSV file here, or click to select
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supported formats: .csv, .txt (tab-separated)
                </p>
                <Button 
                  type="button"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 rounded-xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose File
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Parse Results */}
      {parseResult && (
        <Card className="bg-white/70 backdrop-blur-lg border-white/20 shadow-xl rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center space-x-3 text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span>Parse Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
              <div className="text-center bg-blue-50/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-blue-200/30">
                <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {parseResult.meta.rowCount}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-2">Total Rows</div>
              </div>
              <div className="text-center bg-green-50/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-green-200/30">
                <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  {parseResult.data.length}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-2">Valid Campaigns</div>
              </div>
              <div className="text-center bg-red-50/50 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-red-200/30">
                <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  {parseResult.errors.length}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-2">Errors</div>
              </div>
            </div>

            {parseResult.errors.length > 0 && (
              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-red-100 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="font-semibold text-red-800 text-base">Validation Errors</span>
                </div>
                <div className="bg-white/50 rounded-xl p-4 max-h-64 overflow-y-auto">
                  <ul className="space-y-2">
                    {parseResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index} className="text-sm text-red-700 flex items-start">
                        <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>{error}</span>
                      </li>
                    ))}
                    {parseResult.errors.length > 10 && (
                      <li className="text-sm text-red-600 font-medium border-t border-red-200/50 pt-2 mt-3">
                        ... and {parseResult.errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {parseResult.data.length > 0 && (
              <div className="bg-green-50/80 backdrop-blur-sm border border-green-200/50 rounded-2xl p-4 lg:p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-800 text-base">
                      ✅ Ready to Import
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      {parseResult.data.length} campaign{parseResult.data.length !== 1 ? 's are' : ' is'} ready to be created
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
