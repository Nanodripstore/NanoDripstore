'use client';

import { useState } from 'react';
import { ProxiedImage } from '@/components/proxied-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function GoogleDriveManagerPage() {
  const [testUrl, setTestUrl] = useState('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products/live?limit=5');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testSingleUrl = async () => {
    if (!testUrl.trim()) return;

    try {
      const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(testUrl)}`);
      const result = {
        url: testUrl,
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type'),
        timestamp: new Date().toLocaleTimeString()
      };
      
      setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      setTestResults(prev => [{
        url: testUrl,
        status: 'Error',
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toLocaleTimeString()
      }, ...prev.slice(0, 9)]);
    }
  };

  const syncWithCacheWarming = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/sync-with-cache-warming?warmCache=true', {
        method: 'POST'
      });
      const result = await response.json();
      console.log('Sync result:', result);
      // Reload products after sync
      await loadProducts();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Google Drive Image Manager</h1>
      
      {/* URL Testing Section */}
      <Card>
        <CardHeader>
          <CardTitle>Test Image URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Google Drive image URL..."
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={testSingleUrl} disabled={!testUrl.trim()}>
              Test URL
            </Button>
          </div>
          
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Recent Test Results:</h3>
              {testResults.slice(0, 3).map((result, index) => (
                <div key={index} className={`p-2 rounded text-sm ${result.ok ? 'bg-green-100' : 'bg-red-100'}`}>
                  <div className="font-mono text-xs break-all">{result.url}</div>
                  <div>Status: {result.status} | Time: {result.timestamp}</div>
                  {result.ok && (
                    <div className="mt-2">
                      <ProxiedImage
                        src={result.url}
                        alt="Test result"
                        width={100}
                        height={100}
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Product Images
            <div className="space-x-2">
              <Button onClick={loadProducts} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Load Products'}
              </Button>
              <Button onClick={syncWithCacheWarming} disabled={isLoading} variant="outline">
                {isLoading ? 'Syncing...' : 'Sync & Warm Cache'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground">Click "Load Products" to see current products with images.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {product.images?.slice(0, 4).map((imageUrl: string, index: number) => (
                      <div key={index} className="relative">
                        <ProxiedImage
                          src={imageUrl}
                          alt={`${product.name} image ${index + 1}`}
                          width={120}
                          height={120}
                          className="object-cover rounded"
                        />
                        <div className="absolute bottom-0 left-0 bg-black/70 text-white text-xs px-1">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {product.images?.length || 0} images total
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
