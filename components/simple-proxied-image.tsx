'use client';

import { useState, useEffect } from 'react';
import { cn, getDriveDirectLink } from '@/lib/utils';

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
  const [currentSrc, setCurrentSrc] = useState('');
  const [retryCount, setRetryCount] = useState(0);

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

  // Use proxied Google Drive URLs to avoid CORS issues
  const imageSrc = getDriveDirectLink(src);

  // Update current src when src prop changes
  useEffect(() => {
    setCurrentSrc(imageSrc);
    setHasError(false);
    setIsLoading(true);
    setRetryCount(0);
  }, [imageSrc]);

  console.log('ProxiedDriveImage:', { 
    original: src, 
    proxied: imageSrc,
    alt,
    retryCount
  });

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
    console.log('Proxied drive image loaded successfully:', currentSrc);
  };

  const handleError = (e: any) => {
    console.error('Proxied drive image failed to load:', currentSrc, e);
    
    // Try fallback URLs if this is a Google Drive image and we haven't retried too much
    if (currentSrc.includes('/api/drive-proxy') && retryCount < 2) {
      const fileIdMatch = currentSrc.match(/id%3D([^%&]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        const fallbackUrls = [
          `/api/drive-proxy?url=${encodeURIComponent(`https://drive.google.com/uc?export=view&id=${fileId}`)}`,
          `/api/drive-proxy?url=${encodeURIComponent(`https://drive.google.com/thumbnail?id=${fileId}&sz=w800`)}`
        ];
        
        if (fallbackUrls[retryCount]) {
          console.log(`Trying fallback URL ${retryCount + 1}:`, fallbackUrls[retryCount]);
          setCurrentSrc(fallbackUrls[retryCount]);
          setRetryCount(retryCount + 1);
          setIsLoading(true);
          return; // Don't set error state yet
        }
      }
    }
    
    // All retries failed
    setIsLoading(false);
    setHasError(true);
    onError?.();
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
        src={currentSrc}
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
