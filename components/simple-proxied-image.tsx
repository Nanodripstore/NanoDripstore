'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SimpleProxiedImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export function SimpleProxiedImage({
  src,
  alt,
  className,
  style,
  onLoad,
  onError
}: SimpleProxiedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle empty or invalid src
  if (!src || src.trim() === '') {
    return (
      <div className={cn(
        'bg-gray-200 flex items-center justify-center text-gray-500 text-sm',
        className
      )} style={style}>
        {alt || 'Image unavailable'}
      </div>
    );
  }

  // Use direct URLs - no proxy needed for Google Drive direct access URLs
  const imageSrc = src;

  console.log('SimpleDirectImage:', { 
    original: src, 
    direct: imageSrc,
    alt 
  });

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
    console.log('Direct image loaded successfully:', imageSrc);
  };

  const handleError = (e: any) => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
    console.error('Direct image failed to load:', imageSrc, e);
  };

  // Fallback image for errors
  if (hasError) {
    return (
      <div className={cn(
        'bg-gray-200 flex items-center justify-center text-gray-500 text-sm',
        className
      )} style={style}>
        {alt || 'Image unavailable'}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} style={style}>
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default SimpleProxiedImage;
