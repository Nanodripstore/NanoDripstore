'use client';

import { useState } from 'react';

export default function GoogleDriveTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Your actual file ID
  const fileId = '1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H';

  const testUrls = [
    `https://drive.google.com/uc?export=view&id=${fileId}`, // Current format
    `https://drive.google.com/uc?id=${fileId}`, // Alternative format
    `https://lh3.googleusercontent.com/d/${fileId}`, // Google User Content
    `https://docs.google.com/uc?export=view&id=${fileId}`, // Docs format
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`, // Thumbnail format
  ];

  const testUrls2 = testUrls.map(url => ({
    url,
    format: url.includes('lh3.googleusercontent') ? 'Google User Content' :
            url.includes('thumbnail') ? 'Thumbnail' :
            url.includes('docs.google') ? 'Docs UC' :
            url.includes('uc?id=') ? 'UC ID only' : 'UC Export View'
  }));

  const testAllUrls = async () => {
    setIsLoading(true);
    setTestResults([]);

    const results = [];
    for (const { url, format } of testUrls2) {
      try {
        console.log(`Testing ${format}: ${url}`);
        
        const response = await fetch(`/api/image-proxy?url=${encodeURIComponent(url)}`);
        const result = {
          url,
          format,
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          error: response.ok ? null : await response.text()
        };
        
        results.push(result);
        setTestResults([...results]);
      } catch (error) {
        results.push({
          url,
          format,
          status: 'Error',
          ok: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        setTestResults([...results]);
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Google Drive URL Format Test</h1>
      <p className="mb-4">Testing different Google Drive URL formats for file ID: <code className="bg-gray-100 px-2 py-1 rounded">{fileId}</code></p>
      
      <button 
        onClick={testAllUrls}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-6"
      >
        {isLoading ? 'Testing...' : 'Test All URL Formats'}
      </button>

      <div className="space-y-4">
        {testUrls2.map(({ url, format }, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">{format}</h3>
            <p className="text-sm text-gray-600 mb-2 break-all">{url}</p>
            
            {testResults[index] && (
              <div className={`p-2 rounded ${testResults[index].ok ? 'bg-green-100' : 'bg-red-100'}`}>
                <p><strong>Status:</strong> {testResults[index].status}</p>
                <p><strong>OK:</strong> {testResults[index].ok ? 'Yes' : 'No'}</p>
                {testResults[index].contentType && (
                  <p><strong>Content Type:</strong> {testResults[index].contentType}</p>
                )}
                {testResults[index].error && (
                  <p><strong>Error:</strong> {testResults[index].error}</p>
                )}
              </div>
            )}
            
            {testResults[index]?.ok && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Image Preview:</p>
                <img 
                  src={`/api/image-proxy?url=${encodeURIComponent(url)}`}
                  alt={`Preview of ${format}`}
                  className="max-w-sm max-h-64 object-contain border"
                  onError={(e) => {
                    console.error(`Failed to load image: ${format}`);
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
