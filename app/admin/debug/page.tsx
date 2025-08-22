"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  timestamp: string;
  environment: string;
  environmentVariables: {
    status: string;
    missing: string[];
    details: { [key: string]: any };
  };
  googleSheetsConnection: any;
  sheetAccess: any;
  recommendations: string[];
}

export default function SheetDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/debug/sheet');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setDiagnostic(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'ALL_PRESENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'ERROR':
      case 'MISSING_VARS':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
      case 'ALL_PRESENT':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'ERROR':
      case 'MISSING_VARS':
        return <Badge variant="destructive">Error</Badge>;
      case 'PRESENT':
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>;
      case 'MISSING':
        return <Badge variant="destructive">Missing</Badge>;
      case 'PLACEHOLDER':
        return <Badge variant="secondary">Placeholder</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Google Sheets Diagnostic</h1>
        <p className="text-muted-foreground">
          Diagnose and troubleshoot Google Sheets integration issues
        </p>
      </div>

      <div className="mb-4">
        <Button 
          onClick={runDiagnostic} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {loading ? 'Running Diagnostic...' : 'Run Diagnostic'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Diagnostic Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {diagnostic && (
        <div className="space-y-6">
          {/* Environment Variables */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(diagnostic.environmentVariables.status)}
                Environment Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                {getStatusBadge(diagnostic.environmentVariables.status)}
                <span className="ml-2 text-sm text-muted-foreground">
                  Environment: {diagnostic.environment}
                </span>
              </div>

              {diagnostic.environmentVariables.missing.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 rounded-md">
                  <h4 className="font-medium text-red-800 mb-2">Missing Variables:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {diagnostic.environmentVariables.missing.map((varName) => (
                      <li key={varName} className="font-mono">• {varName}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-2">
                {Object.entries(diagnostic.environmentVariables.details).map(([key, details]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-mono text-sm">{key}</span>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(details.status)}
                      {details.value && (
                        <span className="text-xs text-muted-foreground font-mono">
                          {details.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Google Sheets Connection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(diagnostic.googleSheetsConnection?.status || 'ERROR')}
                Google Sheets API Connection
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagnostic.googleSheetsConnection ? (
                <div>
                  {getStatusBadge(diagnostic.googleSheetsConnection.status)}
                  {diagnostic.googleSheetsConnection.message && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {diagnostic.googleSheetsConnection.message}
                    </p>
                  )}
                  {diagnostic.googleSheetsConnection.error && (
                    <div className="mt-2 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-700">
                        <strong>Error:</strong> {diagnostic.googleSheetsConnection.error}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Badge variant="secondary">Not tested</Badge>
              )}
            </CardContent>
          </Card>

          {/* Sheet Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(diagnostic.sheetAccess?.status || 'ERROR')}
                Sheet Access Test
              </CardTitle>
            </CardHeader>
            <CardContent>
              {diagnostic.sheetAccess ? (
                <div>
                  {getStatusBadge(diagnostic.sheetAccess.status)}
                  
                  {diagnostic.sheetAccess.status === 'SUCCESS' && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <strong>Sheet Title:</strong> {diagnostic.sheetAccess.sheetTitle}
                      </div>
                      <div>
                        <strong>Sheet ID:</strong> 
                        <span className="font-mono text-sm ml-2">{diagnostic.sheetAccess.sheetId}</span>
                      </div>
                      {diagnostic.sheetAccess.sheets && (
                        <div>
                          <strong>Available Sheets:</strong>
                          <ul className="ml-4 mt-1">
                            {diagnostic.sheetAccess.sheets.map((sheetName: string, index: number) => (
                              <li key={index} className="text-sm">• {sheetName}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {diagnostic.sheetAccess.sampleData && (
                        <div className="p-3 bg-green-50 rounded-md">
                          <h4 className="font-medium text-green-800 mb-2">Sample Data:</h4>
                          <div className="text-sm text-green-700 space-y-1">
                            <div>Rows: {diagnostic.sheetAccess.sampleData.rowCount}</div>
                            <div>Columns: {diagnostic.sheetAccess.sampleData.columnCount}</div>
                            {diagnostic.sheetAccess.sampleData.headers.length > 0 && (
                              <div>
                                <strong>Headers:</strong> {diagnostic.sheetAccess.sampleData.headers.slice(0, 5).join(', ')}
                                {diagnostic.sheetAccess.sampleData.headers.length > 5 && '...'}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {diagnostic.sheetAccess.error && (
                    <div className="mt-2 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-700">
                        <strong>Error:</strong> {diagnostic.sheetAccess.error}
                      </p>
                      {diagnostic.sheetAccess.code && (
                        <p className="text-sm text-red-600 mt-1">
                          <strong>Code:</strong> {diagnostic.sheetAccess.code}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Badge variant="secondary">Not tested</Badge>
              )}
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {diagnostic.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span className="text-sm">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground text-center">
            Last run: {new Date(diagnostic.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
