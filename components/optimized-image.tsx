'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes,
  fill = false,
  style,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Process the image URL for optimal loading
  const processedSrc = processImageUrl(src);

  // Debug logging
  console.log('OptimizedImage:', { 
    original: src, 
    processed: processedSrc,
    alt 
  });

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
    console.log('Image loaded successfully:', processedSrc);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
    console.error('Image failed to load:', processedSrc);
  };

  // Fallback image for errors
  const fallbackSrc = '/placeholder-image.svg'; // You can create a placeholder image

  // If processedSrc is null/empty and fallbackSrc is also empty, don't render Image
  if (!processedSrc && !fallbackSrc) {
    return (
      <div className={cn(
        'bg-gray-200 flex items-center justify-center text-gray-500 text-sm',
        className
      )} style={style}>
        {alt || 'Image unavailable'}
      </div>
    );
  }

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
    <div className={cn('relative', className)}>
      {/* Loading indicator */}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10',
          fill ? 'w-full h-full' : `w-[${width}px] h-[${height}px]`
        )}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      )}

      <Image
        src={processedSrc || fallbackSrc}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        style={style}
        onLoad={handleLoad}
        onError={handleError}
        // Optimize for Google Drive images
        unoptimized={processedSrc?.includes('drive.google.com')}
      />
    </div>
  );
}

// Enhanced image URL processor (same as in live-sheet-sync.ts)
function processImageUrl(url: string): string | null {
  if (!url || url.trim().length === 0) {
    return null;
  }

  const trimmedUrl = url.trim();

  // If it's already a direct HTTP/HTTPS URL (not a Google Drive share link), return as is
  if (trimmedUrl.startsWith('http') && !trimmedUrl.includes('drive.google.com/file/d/')) {
    return trimmedUrl;
  }

  // Handle local paths
  if (trimmedUrl.startsWith('/')) {
    return trimmedUrl;
  }

  // Handle Google Drive shareable links
  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const driveShareMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveShareMatch) {
    const fileId = driveShareMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Handle Google Drive direct view links (already optimized)
  if (trimmedUrl.includes('drive.google.com/uc?')) {
    return trimmedUrl;
  }

  // Handle bare Google Drive file IDs
  if (/^[a-zA-Z0-9_-]{28,}$/.test(trimmedUrl)) {
    return `https://drive.google.com/uc?export=view&id=${trimmedUrl}`;
  }

  // Handle other cloud storage providers
  if (trimmedUrl.includes('cloudinary.com') || 
      trimmedUrl.includes('amazonaws.com') || 
      trimmedUrl.includes('s3.') ||
      trimmedUrl.includes('firebasestorage.googleapis.com')) {
    return trimmedUrl;
  }

  return null;
}

export default OptimizedImage;
