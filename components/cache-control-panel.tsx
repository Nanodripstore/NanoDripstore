"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Database, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { clearSheetCache, triggerCacheRefresh } from '@/hooks/use-cache';

export default function CacheControlPanel() {
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      await clearSheetCache();
      toast.success('Sheet cache cleared successfully!');
    } catch (error) {
      toast.error('Failed to clear cache');
      console.error('Cache clear error:', error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleForceRefresh = () => {
    toast.info('Forcing page refresh...');
    triggerCacheRefresh();
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Cache Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleClearCache}
            disabled={isClearing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
            {isClearing ? 'Clearing...' : 'Clear Sheet Cache'}
          </Button>

          <Button
            onClick={handleForceRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            Force Page Refresh
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Clear Sheet Cache:</strong> Removes cached product data from memory, forces fresh data from Google Sheets on next request.</p>
          <p><strong>Force Page Refresh:</strong> Reloads the page with cache-busting parameters to get the latest data.</p>
          <p><strong>Auto-refresh:</strong> Products automatically refresh every 1 minute, and when you switch browser tabs or reload the page.</p>
        </div>
      </CardContent>
    </Card>
  );
}
