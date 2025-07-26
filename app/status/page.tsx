'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Server, AlertCircle, CheckCircle } from 'lucide-react';

interface HealthStatus {
  status: string;
  message: string;
  database?: string;
  databaseType?: string;
  userCount?: number;
  environment?: string;
  hasDbUrl?: boolean;
  hasTursoToken?: boolean;
  timestamp?: string;
  error?: string;
  errorCode?: string;
}

export default function DatabaseStatusPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealthStatus(data);
      setLastChecked(new Date());
    } catch (error) {
      setHealthStatus({
        status: 'ERROR',
        message: 'Failed to reach health endpoint',
        error: error instanceof Error ? error.message : 'Network error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy = healthStatus?.status === 'OK';

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Database className="h-8 w-8" />
          Database Status
        </h1>
        <p className="text-muted-foreground">
          Real-time database connectivity and system health monitoring
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Main Status Card */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {isHealthy ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <Badge variant={isHealthy ? "default" : "destructive"}>
                {healthStatus?.status || 'UNKNOWN'}
              </Badge>
              <span className="text-lg font-semibold">
                {healthStatus?.message || 'Checking...'}
              </span>
            </div>
            {lastChecked && (
              <p className="text-sm text-muted-foreground mt-2">
                Last checked: {lastChecked.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Database Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Database Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Connection:</span>
              <Badge variant={healthStatus?.database === 'Connected' ? "default" : "destructive"}>
                {healthStatus?.database || 'Unknown'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-mono text-sm">{healthStatus?.databaseType || 'Unknown'}</span>
            </div>
            <div className="flex justify-between">
              <span>User Count:</span>
              <span className="font-mono text-sm">{healthStatus?.userCount ?? 'N/A'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Environment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Environment:</span>
              <Badge variant="outline">
                {healthStatus?.environment || 'Unknown'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>DB URL Configured:</span>
              <Badge variant={healthStatus?.hasDbUrl ? "default" : "destructive"}>
                {healthStatus?.hasDbUrl ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Turso Token:</span>
              <Badge variant={healthStatus?.hasTursoToken ? "default" : "secondary"}>
                {healthStatus?.hasTursoToken ? 'Present' : 'Not Set'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Error Details (if any) */}
        {healthStatus?.error && (
          <Card className="md:col-span-2 border-red-200">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-red-600">Error Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold">Error:</span>
                  <pre className="mt-1 p-2 bg-red-50 rounded text-sm overflow-x-auto">
                    {healthStatus.error}
                  </pre>
                </div>
                {healthStatus.errorCode && (
                  <div>
                    <span className="font-semibold">Error Code:</span>
                    <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-sm">
                      {healthStatus.errorCode}
                    </code>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Timestamp */}
      {healthStatus?.timestamp && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Server timestamp: {new Date(healthStatus.timestamp).toLocaleString()}
        </div>
      )}
    </div>
  );
}
