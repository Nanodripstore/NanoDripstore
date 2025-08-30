"use client";

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  className,
  placeholder = '/placeholder.jpg',
  priority = false,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Handle empty or invalid src
  if (!src || src.trim() === '') {
    return (
      <div className={cn('bg-gray-200 flex items-center justify-center text-gray-500 text-sm', className)}>
        {alt || 'Image unavailable'}
      </div>
    );
  }

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  return (
    <div 
      ref={imgRef}
      className={cn(
        "relative overflow-hidden bg-gray-100",
        className
      )}
    >
      {/* Placeholder */}
      <div
        className={cn(
          "absolute inset-0 bg-gray-200 animate-pulse transition-opacity duration-300",
          (!isLoading && !hasError) && "opacity-0"
        )}
      />
      
      {/* Actual image */}
      {(isInView || priority) && (
        <img
          src={hasError ? placeholder : (src || placeholder)}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading && "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );
}
