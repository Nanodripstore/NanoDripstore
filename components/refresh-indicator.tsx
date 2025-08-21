"use client";

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function RefreshIndicator({ 
  isRefreshing, 
  lastUpdated, 
  onManualRefresh 
}: { 
  isRefreshing?: boolean;
  lastUpdated?: Date;
  onManualRefresh?: () => void;
}) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        setTimeAgo(`${diffInSeconds}s ago`);
      } else if (diffInSeconds < 3600) {
        setTimeAgo(`${Math.floor(diffInSeconds / 60)}m ago`);
      } else {
        setTimeAgo(`${Math.floor(diffInSeconds / 3600)}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      {isRefreshing ? (
        <Badge variant="secondary" className="animate-pulse">
          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
          Refreshing...
        </Badge>
      ) : (
        <>
          {lastUpdated && (
            <span>Updated {timeAgo}</span>
          )}
          {onManualRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onManualRefresh}
              className="h-6 px-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </>
      )}
    </div>
  );
}
