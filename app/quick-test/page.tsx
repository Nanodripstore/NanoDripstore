'use client';

import { SimpleProxiedImage } from '@/components/simple-proxied-image';

export default function QuickImageTestPage() {
  // Your actual Google Drive URLs
  const testUrls = [
    'https://drive.google.com/uc?export=view&id=1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H',
    'https://drive.google.com/uc?export=view&id=1WdwEBU3UMAREI7_-ZLRn0UAPBX8dIwz6',
    // Test with a known working image for comparison
    'https://picsum.photos/400/400'
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Quick Image Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testUrls.map((url, index) => (
          <div key={index} className="border rounded-lg p-4">
            <h3 className="text-sm font-medium mb-2">Test {index + 1}</h3>
            
            {/* Match the exact structure from product-showcase */}
            <div className="relative w-full h-64 bg-gray-100 rounded overflow-hidden">
              <div className="relative w-full h-full">
                <SimpleProxiedImage
                  src={url}
                  alt={`Test image ${index + 1}`}
                  className="w-full h-full transition-all duration-500"
                />
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-gray-500 break-all">{url}</p>
              <p className="text-xs text-blue-600 mt-1">
                Proxy URL: /api/image-proxy?url={encodeURIComponent(url)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h2 className="font-semibold text-yellow-800 mb-2">Debug Info:</h2>
        <p className="text-sm text-yellow-700">
          Check the browser console for detailed logging from SimpleProxiedImage component.
        </p>
        <p className="text-sm text-yellow-700 mt-1">
          If images don't load, verify the proxy is working: 
          <a 
            href="/api/image-proxy?url=https://drive.google.com/uc?export=view%26id=1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H"
            target="_blank"
            className="underline ml-1"
          >
            Test Proxy Link
          </a>
        </p>
      </div>
    </div>
  );
}
