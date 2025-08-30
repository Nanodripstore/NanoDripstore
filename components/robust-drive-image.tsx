'use client';

import { useState } from 'react';
import { cn, getGoogleDriveUrlVariants } from '@/lib/utils';

interface RobustDriveImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
  width?: number;
  height?: number;
}

export function RobustDriveImage({
  src,
  alt,
  className,
  style,
  onLoad,
  onError,
  width = 400,
  height = 300,
}: RobustDriveImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentAttempt, setCurrentAttempt] = useState(0);

  // Handle empty or invalid src
  if (!src || src.trim() === '') {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center text-gray-500 text-sm',
          className
        )} 
        style={{ ...style, width, height }}
      >
        {alt || 'Image unavailable'}
      </div>
    );
  }

  // Get all URL variants for fallback strategies
  const urlVariants = getGoogleDriveUrlVariants(src);
  const maxAttempts = urlVariants.length;

  const imageSrc = currentAttempt < maxAttempts ? urlVariants[currentAttempt] : '/placeholder-image.svg';

  console.log('RobustDriveImage:', { 
    original: src, 
    attempt: currentAttempt + 1,
    maxAttempts,
    currentSrc: imageSrc,
    alt 
  });

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
    console.log('Robust drive image loaded successfully on attempt', currentAttempt + 1, ':', imageSrc);
  };

  const handleError = (e: any) => {
    console.error('Robust drive image failed to load on attempt', currentAttempt + 1, ':', imageSrc, e);
    
    if (currentAttempt < maxAttempts - 1) {
      // Try next fallback strategy
      setCurrentAttempt(prev => prev + 1);
      setHasError(false);
      setIsLoading(true);
    } else {
      // All attempts failed
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }
  };

  // Fallback image for final errors
  if (hasError && currentAttempt >= maxAttempts - 1) {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center text-gray-500 text-sm',
          className
        )} 
        style={{ ...style, width, height }}
      >
        {alt || 'Image unavailable'}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={cn('object-cover', className)}
      style={{ ...style, width, height }}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
    />
  );
}
