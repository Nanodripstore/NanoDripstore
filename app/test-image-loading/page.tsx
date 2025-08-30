"use client";

import { useState, useEffect } from 'react';
import { SimpleProxiedImage } from '@/components/simple-proxied-image';

export default function TestImagePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadStats, setImageLoadStats] = useState({
    total: 0,
    loaded: 0,
    failed: 0
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products/live');
        const data = await response.json();
        setProducts(data.products || []);
        
        // Count total images
        let totalImages = 0;
        data.products?.forEach((product: any) => {
          if (product.images) totalImages += product.images.length;
        });
        setImageLoadStats(prev => ({ ...prev, total: totalImages }));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleImageLoad = () => {
    setImageLoadStats(prev => ({ ...prev, loaded: prev.loaded + 1 }));
  };

  const handleImageError = () => {
    setImageLoadStats(prev => ({ ...prev, failed: prev.failed + 1 }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Image Loading Test</h1>
        
        {/* Stats */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow">
          <h2 className="text-xl font-semibold mb-4">Loading Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{imageLoadStats.total}</div>
              <div className="text-sm text-gray-600">Total Images</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{imageLoadStats.loaded}</div>
              <div className="text-sm text-gray-600">Loaded Successfully</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{imageLoadStats.failed}</div>
              <div className="text-sm text-gray-600">Failed to Load</div>
            </div>
          </div>
          
          {imageLoadStats.total > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((imageLoadStats.loaded + imageLoadStats.failed) / imageLoadStats.total) * 100}%` 
                  }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Progress: {imageLoadStats.loaded + imageLoadStats.failed} / {imageLoadStats.total} 
                ({Math.round(((imageLoadStats.loaded + imageLoadStats.failed) / imageLoadStats.total) * 100)}%)
              </p>
            </div>
          )}
        </div>

        {/* Products */}
        <div className="space-y-8">
          {products.map((product, productIndex) => (
            <div key={product.id} className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-2xl font-semibold mb-4">
                {productIndex + 1}. {product.name}
              </h2>
              
              {/* Product Images */}
              {product.images && product.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Product Images ({product.images.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.images.map((image: string, imageIndex: number) => (
                      <div key={imageIndex} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                        <SimpleProxiedImage
                          src={image}
                          alt={`${product.name} - Image ${imageIndex + 1}`}
                          className="w-full h-full"
                          onLoad={handleImageLoad}
                          onError={handleImageError}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Images */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Variant Images</h3>
                  <div className="space-y-4">
                    {product.variants.slice(0, 3).map((variant: any, variantIndex: number) => (
                      variant.images && variant.images.length > 0 && (
                        <div key={variantIndex} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">
                            {variant.colorName} ({variant.images.length} images)
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {variant.images.map((image: string, imageIndex: number) => (
                              <div key={imageIndex} className="aspect-square bg-gray-100 rounded overflow-hidden">
                                <SimpleProxiedImage
                                  src={image}
                                  alt={`${product.name} - ${variant.colorName} - Image ${imageIndex + 1}`}
                                  className="w-full h-full"
                                  onLoad={handleImageLoad}
                                  onError={handleImageError}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
