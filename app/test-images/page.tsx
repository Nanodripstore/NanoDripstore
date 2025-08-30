'use client';

import { SimpleImageTest } from '@/components/simple-image-test';
import { SimpleProxiedImage } from '@/components/simple-proxied-image';
import { ProxiedImage } from '@/components/proxied-image';

export default function ImageTestPage() {
  // Test URLs from your actual data
  const testUrls = [
    'https://drive.google.com/uc?export=view&id=1caJMPkHYuQY6UnLOCYGRFlwctPnB6A1H',
    'https://drive.google.com/uc?export=view&id=1WdwEBU3UMAREI7_-ZLRn0UAPBX8dIwz6',
    // Test with a known working image
    'https://picsum.photos/400/400',
    // Test with local image
    '/placeholder-image.svg'
  ];

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Image Loading Test</h1>
      
      <div className="space-y-8">
        {testUrls.map((url, index) => (
          <div key={index} className="border p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Test {index + 1}: {url}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-md font-medium mb-2">Simple img tag:</h3>
                <SimpleImageTest src={url} alt={`Test image ${index + 1}`} />
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">SimpleProxiedImage component:</h3>
                <div className="relative w-full h-64">
                  <SimpleProxiedImage
                    src={url}
                    alt={`Test image ${index + 1}`}
                    className="w-full h-full"
                  />
                </div>
              </div>
              
              <div>
                <h3 className="text-md font-medium mb-2">ProxiedImage component:</h3>
                <div className="relative w-full h-64">
                  <ProxiedImage
                    src={url}
                    alt={`Test image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
