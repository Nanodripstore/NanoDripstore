'use client';

import Image from 'next/image';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProxiedImageProps {
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

export function ProxiedImage({
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
}: ProxiedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Handle empty or invalid src
  if (!src || src.trim() === '') {
    return (
      <div className={cn(
        'bg-gray-200 flex items-center justify-center text-gray-500 text-sm',
        fill ? 'w-full h-full' : `w-[${width}px] h-[${height}px]`,
        className
      )} style={style}>
        {alt || 'Image unavailable'}
      </div>
    );
  }

  // Use proxy for Google Drive images, direct URL for others
  const shouldProxy = src.includes('drive.google.com');
  const imageSrc = shouldProxy 
    ? `/api/image-proxy?url=${encodeURIComponent(src)}`
    : src;

  // Double check that imageSrc is valid
  if (!imageSrc || imageSrc.trim() === '') {
    return (
      <div className={cn(
        'bg-gray-200 flex items-center justify-center text-gray-500 text-sm',
        fill ? 'w-full h-full' : `w-[${width}px] h-[${height}px]`,
        className
      )} style={style}>
        {alt || 'Image unavailable'}
      </div>
    );
  }

  console.log('ProxiedImage:', { 
    original: src, 
    proxied: imageSrc,
    shouldProxy,
    alt 
  });

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
    console.log('Proxied image loaded successfully:', imageSrc);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
    console.error('Proxied image failed to load:', imageSrc);
  };

  // Fallback image for errors
  const fallbackSrc = '/placeholder-image.svg';

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
        src={imageSrc || fallbackSrc}
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
        unoptimized={shouldProxy} // Don't optimize proxied images
      />
    </div>
  );
}

export default ProxiedImage;
