'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  RefreshCw, 
  Database, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Play,
  Settings,
  Info
} from 'lucide-react';

interface SyncResult {
  success: boolean;
  message: string;
  stats?: {
    processed: number;
    created: number;
    updated: number;
    errors: number;
    products: number;
    variants: number;
  };
}

interface SyncStatus {
  sheetId: string;
  lastSync: string;
  status: string;
}

export default function LiveSyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/products/sync');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch sync status:', error);
    }
  };

  const handleManualSync = async () => {
    setSyncing(true);
    setProgress(0);
    setResult(null);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      const response = await fetch('/api/products/sync', {
        method: 'POST',
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await response.json();
      setResult(data);
      
      // Update status after sync
      await fetchSyncStatus();
    } catch (error) {
      console.error('Sync error:', error);
      setResult({
        success: false,
        message: 'Sync failed',
      });
    } finally {
      setSyncing(false);
      setProgress(0);
    }
  };

  const openGoogleSheet = () => {
    if (sheetUrl) {
      window.open(sheetUrl, '_blank');
    }
  };

  const createNewSheet = () => {
    const templateUrl = 'https://docs.google.com/spreadsheets/d/1your-template-id/copy';
    window.open(templateUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Live Sheet Sync</h1>
        <p className="text-muted-foreground">
          Automatically sync products from your Google Sheet database. Add or update products in the sheet and they'll appear on your website.
        </p>
      </div>

      {/* Sync Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {status?.status === 'Ready' ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Not Configured
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {status?.lastSync === 'Never' ? 'Never synced' : 
               status?.lastSync ? new Date(status.lastSync).toLocaleString() : 'Loading...'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sheet ID</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground truncate">
              {status?.sheetId === 'Not configured' ? 'Not set' : status?.sheetId || 'Loading...'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Results */}
      {result && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Sync Results
            </CardTitle>
            <CardDescription>{result.message}</CardDescription>
          </CardHeader>
          {result.stats && (
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.stats.processed}</div>
                  <div className="text-sm text-muted-foreground">Processed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{result.stats.created}</div>
                  <div className="text-sm text-muted-foreground">Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{result.stats.updated}</div>
                  <div className="text-sm text-muted-foreground">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{result.stats.products}</div>
                  <div className="text-sm text-muted-foreground">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{result.stats.errors}</div>
                  <div className="text-sm text-muted-foreground">Errors</div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Progress Bar */}
      {syncing && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Syncing products from sheet...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Manual Sync
            </CardTitle>
            <CardDescription>
              Manually trigger a sync with your Google Sheet to update products immediately.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sheetUrl">Google Sheet URL (Optional)</Label>
              <Input
                id="sheetUrl"
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter your sheet URL to quickly open it for editing
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleManualSync}
                disabled={syncing || status?.status !== 'Ready'}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {syncing ? 'Syncing...' : 'Sync Now'}
              </Button>
              
              {sheetUrl && (
                <Button
                  onClick={openGoogleSheet}
                  variant="outline"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Setup Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Setup Guide
            </CardTitle>
            <CardDescription>
              Configure your Google Sheet for automatic product syncing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 font-semibold text-xs">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Create Your Sheet</p>
                  <p className="text-xs text-muted-foreground">
                    Use our template with proper column structure
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-green-600 font-semibold text-xs">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Configure API Access</p>
                  <p className="text-xs text-muted-foreground">
                    Set up Google Sheets API credentials
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 font-semibold text-xs">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Add Products</p>
                  <p className="text-xs text-muted-foreground">
                    Each row = one product variant (color + size)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={createNewSheet}
                variant="outline"
                className="flex-1"
              >
                Create Sheet Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sheet Structure Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Sheet Structure
          </CardTitle>
          <CardDescription>
            Your Google Sheet should have these columns in this exact order:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="outline">A: product_id</Badge>
              <Badge variant="outline">B: name</Badge>
              <Badge variant="outline">C: description</Badge>
              <Badge variant="outline">D: category</Badge>
              <Badge variant="outline">E: type</Badge>
              <Badge variant="outline">F: base_price</Badge>
              <Badge variant="outline">G: color_name</Badge>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">H: color_hex</Badge>
              <Badge variant="outline">I: size</Badge>
              <Badge variant="outline">J: variant_sku</Badge>
              <Badge variant="outline">K: variant_price</Badge>
              <Badge variant="outline">L: stock_quantity</Badge>
              <Badge variant="outline">M: image_url_1</Badge>
              <Badge variant="outline">N: image_url_2</Badge>
            </div>
            <div className="space-y-2">
              <Badge variant="outline">O: image_url_3</Badge>
              <Badge variant="outline">P: tags</Badge>
              <Badge variant="outline">Q: is_new</Badge>
              <Badge variant="outline">R: is_bestseller</Badge>
              <Badge variant="outline">S: is_active</Badge>
              <Badge variant="outline">T: created_date</Badge>
              <Badge variant="outline">U: last_updated</Badge>
            </div>
          </div>
          
          <Alert className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Each row represents one product variant. For a t-shirt with 3 colors and 4 sizes, you'll need 12 rows (3×4) with the same product_id but different color_name and size values.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
