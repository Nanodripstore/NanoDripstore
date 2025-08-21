'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, FileSpreadsheet, AlertCircle, CheckCircle, X } from 'lucide-react';

interface ImportResult {
  message: string;
  created: number;
  updated: number;
  errors: string[];
  products: any[];
}

export default function ProductImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [googleSheetData, setGoogleSheetData] = useState({
    spreadsheetId: '',
    range: 'Sheet1!A:L'
  });
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        message: 'Import failed',
        created: 0,
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        products: []
      });
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const handleGoogleSheetsImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleSheetData.spreadsheetId) return;

    setImporting(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch('/api/products/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(googleSheetData),
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Google Sheets import error:', error);
      setResult({
        message: 'Import failed',
        created: 0,
        updated: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
        products: []
      });
    } finally {
      setImporting(false);
      setProgress(0);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/products/import', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download template');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'product-import-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const clearResult = () => {
    setResult(null);
    setFile(null);
    setGoogleSheetData({ spreadsheetId: '', range: 'Sheet1!A:L' });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Import Products</h1>
        <p className="text-muted-foreground">
          Import products from Excel files or Google Sheets. You can add products with colors, sizes, SKUs, and all necessary details.
        </p>
      </div>

      {/* Results Display */}
      {result && (
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {result.errors.length === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                Import Results
              </CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={clearResult}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{result.created}</div>
                <div className="text-sm text-muted-foreground">Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{result.updated}</div>
                <div className="text-sm text-muted-foreground">Updated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{result.products.length}</div>
                <div className="text-sm text-muted-foreground">Total Processed</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Errors encountered:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {result.errors.slice(0, 5).map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li className="text-sm italic">
                        ... and {result.errors.length - 5} more errors
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress Bar */}
      {importing && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing products...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Download */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Download Template
          </CardTitle>
          <CardDescription>
            Download the Excel template with the required format for product import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={downloadTemplate} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </CardContent>
      </Card>

      {/* Import Options */}
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload File</TabsTrigger>
          <TabsTrigger value="sheets">Google Sheets</TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Excel/CSV File
              </CardTitle>
              <CardDescription>
                Upload an Excel (.xlsx, .xls) or CSV file with your product data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div>
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="mt-1"
                  />
                  {file && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!file || importing}
                  className="w-full"
                >
                  {importing ? 'Importing...' : 'Import from File'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Sheets Tab */}
        <TabsContent value="sheets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Import from Google Sheets
              </CardTitle>
              <CardDescription>
                Import products directly from a Google Sheets document.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGoogleSheetsImport} className="space-y-4">
                <div>
                  <Label htmlFor="spreadsheetId">Spreadsheet ID</Label>
                  <Input
                    id="spreadsheetId"
                    type="text"
                    value={googleSheetData.spreadsheetId}
                    onChange={(e) => setGoogleSheetData({
                      ...googleSheetData,
                      spreadsheetId: e.target.value
                    })}
                    placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                    className="mt-1"
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    Get the spreadsheet ID from the URL: https://docs.google.com/spreadsheets/d/<strong>SPREADSHEET_ID</strong>/edit
                  </div>
                </div>
                <div>
                  <Label htmlFor="range">Range</Label>
                  <Input
                    id="range"
                    type="text"
                    value={googleSheetData.range}
                    onChange={(e) => setGoogleSheetData({
                      ...googleSheetData,
                      range: e.target.value
                    })}
                    placeholder="Sheet1!A:L"
                    className="mt-1"
                  />
                  <div className="mt-1 text-xs text-muted-foreground">
                    Specify the range of cells to import (e.g., Sheet1!A:L for columns A to L)
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={!googleSheetData.spreadsheetId || importing}
                  className="w-full"
                >
                  {importing ? 'Importing...' : 'Import from Google Sheets'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Format Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Expected Format</CardTitle>
          <CardDescription>
            Your spreadsheet should have the following columns:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">name</Badge>
                <span className="text-sm">Product name (required)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">description</Badge>
                <span className="text-sm">Product description</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">price</Badge>
                <span className="text-sm">Product price (required)</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">category</Badge>
                <span className="text-sm">Product category</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">sku</Badge>
                <span className="text-sm">Unique SKU</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">type</Badge>
                <span className="text-sm">Product type (e.g., clothing)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">colors</Badge>
                <span className="text-sm">Comma-separated colors</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">sizes</Badge>
                <span className="text-sm">Comma-separated sizes</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">stock</Badge>
                <span className="text-sm">Available quantity</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">images</Badge>
                <span className="text-sm">Comma-separated image URLs</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">tags</Badge>
                <span className="text-sm">Comma-separated tags</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">isNew</Badge>
                <span className="text-sm">true/false for new products</span>
              </div>
            </div>
          </div>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> Make sure your Google Sheet is publicly accessible or shared with the service account email for Google Sheets integration to work.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
