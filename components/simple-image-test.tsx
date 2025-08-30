'use client';

import { useState } from 'react';

interface SimpleImageTestProps {
  src: string;
  alt: string;
}

export function SimpleImageTest({ src, alt }: SimpleImageTestProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  console.log('SimpleImageTest rendering:', { src, alt });

  // Handle empty or invalid src
  if (!src || src.trim() === '') {
    return (
      <div className="relative w-full h-64 border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
        <span className="text-gray-500">{alt || 'No image source provided'}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 border-2 border-gray-300 bg-gray-100">
      {/* Debug info */}
      <div className="absolute top-0 left-0 bg-black/70 text-white text-xs p-1 max-w-full overflow-hidden">
        URL: {src.substring(0, 50)}...
      </div>
      
      {/* Simple img tag test */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onLoad={() => {
          console.log('Image loaded successfully:', src);
          setIsLoaded(true);
        }}
        onError={(e) => {
          console.error('Image failed to load:', src, e);
          setHasError(true);
        }}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      
      {/* Status indicators */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100">
          <span className="text-red-600 text-sm">❌ Failed to load</span>
        </div>
      )}
      
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-yellow-100">
          <span className="text-yellow-600 text-sm">⏳ Loading...</span>
        </div>
      )}
      
      {isLoaded && !hasError && (
        <div className="absolute bottom-0 right-0 bg-green-500 text-white text-xs p-1">
          ✅ Loaded
        </div>
      )}
    </div>
  );
}

export default SimpleImageTest;
