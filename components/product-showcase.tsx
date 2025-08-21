"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import { useWishlist } from '@/hooks/use-wishlist';
import { useProductsFromSheet } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from "sonner";

export default function ProductShowcase() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartStore();
  const { wishlist, addToWishlist, removeFromWishlistByProductId, isInWishlist, fetchWishlist } = useWishlist();
  const [selectedColors, setSelectedColors] = useState<{ [productId: number]: any }>({});
  const [refreshProducts, setRefreshProducts] = useState(false);
  
  // Force refresh on component mount (page reload)
  useEffect(() => {
    setRefreshProducts(true);
    // Reset after a short delay to allow normal caching afterward
    const timer = setTimeout(() => setRefreshProducts(false), 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Fetch products directly from Google Sheet using optimized hook
  const { data, isLoading, error, refetch } = useProductsFromSheet({
    limit: 6,
    sortBy: 'is_bestseller',
    sortOrder: 'desc',
    refresh: refreshProducts
  });

  // Custom sorting function: bestseller > new > wishlisted > non-wishlisted
  const getSortedProducts = (products: any[]) => {
    if (!products) return [];
    
    return products.slice(0, 6).sort((a, b) => {
      // Priority 1: Bestsellers first
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      
      // Priority 2: New products second
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      
      // Priority 3: Wishlisted products third
      const aIsWishlisted = isInWishlist(a.id);
      const bIsWishlisted = isInWishlist(b.id);
      
      if (aIsWishlisted && !bIsWishlisted) return -1;
      if (!aIsWishlisted && bIsWishlisted) return 1;
      
      // If all priorities are equal, maintain original order
      return 0;
    });
  };

  // Fetch wishlist when component mounts or session changes
  useEffect(() => {
    if (session?.user) {
      fetchWishlist();
    }
  }, [session?.user, fetchWishlist]);

  // Listen for wishlist changes from other components
  useEffect(() => {
    const handleWishlistChange = () => {
      if (session?.user) {
        fetchWishlist();
      }
    };

    // Listen for custom wishlist events
    window.addEventListener('wishlistChanged', handleWishlistChange);
    
    // Listen for localStorage changes (cross-tab updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wishlistLastUpdate') {
        handleWishlistChange();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('wishlistChanged', handleWishlistChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [session?.user, fetchWishlist]);

  const handleAddToCart = (product: any, selectedVariant?: any) => {
    if (!session?.user) {
      toast.error('Please sign in to add items to cart', {
        description: 'You need to be logged in to use the shopping cart',
        action: {
          label: 'Sign In',
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }

    // Use variants if available, otherwise fall back to old color system
    let colorName, variantId, variantSku, variantPrice;
    
    if (product.variants && product.variants.length > 0) {
      // Use selected variant or first available variant
      const variant = selectedVariant || product.variants[0];
      colorName = variant.colorName;
      variantId = variant.id;
      variantSku = variant.sku;
      variantPrice = variant.price || product.price;
    } else {
      // Fallback to old color system
      const colors = typeof product.colors === 'string' 
        ? JSON.parse(product.colors || '[]') 
        : product.colors || [];
      colorName = colors[0]?.name || 'Default';
      variantPrice = product.price;
    }
    
    const defaultSize = product.sizes[2] || product.sizes[0] || 'M'; // Default to M size or first available
    
    addItem({
      id: product.id,
      name: product.name,
      price: variantPrice,
      color: colorName,
      size: defaultSize,
      image: Array.isArray(product.images) && product.images.length > 0 
        ? product.images[0] 
        : '/placeholder-image.jpg',
      type: product.type as 'tshirt' | 'hoodie',
      variantId: variantId,
      sku: variantSku
    });
    
    toast.success(`Added ${product.name} to cart!`, {
      description: `Color: ${colorName} • Size: ${defaultSize} • Price: $${variantPrice.toFixed(2)}`,
    });
  };

  const handleWishlistToggle = async (product: any) => {
    if (!session?.user) {
      toast.error('Please sign in to use wishlist', {
        description: 'You need to be logged in to save items to your wishlist',
        action: {
          label: 'Sign In',
          onClick: () => router.push('/sign-in'),
        },
      });
      return;
    }

    const productId = String(product.id);
    
    if (isInWishlist(productId)) {
      await removeFromWishlistByProductId(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const handleQuickView = (product: any) => {
    // Create a slug from product name
    const slug = product.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/shop/${slug}`);
  };

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">Featured Collection</Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Premium <span className="text-primary">Streetwear</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our carefully curated collection of premium hoodies and t-shirts, 
            each designed with attention to detail and comfort.
          </p>
        </motion.div>

        {/* Product Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {isLoading ? (
            // Loading skeletons
            [...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <Card className="overflow-hidden border-0 shadow-md h-full flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <Skeleton className="h-3 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-full mb-2" />
                      <Skeleton className="h-4 w-1/3 mb-3" />
                      <Skeleton className="h-8 w-full mt-auto" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Failed to load products. Please try again later.</p>
            </div>
          ) : (
            // Products from database with custom sorting
            getSortedProducts(data?.products || []).map((product: any, index: number) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.08,
                    ease: "easeOut"
                  }
                }}
                viewport={{ once: true, margin: "-20px" }}
                whileHover={{ 
                  y: -4,
                  transition: { 
                    duration: 0.2,
                    ease: "easeOut"
                  }
                }}
                className="group"
              >
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-300 bg-card/50 backdrop-blur-sm h-full flex flex-col">
                  <CardContent className="p-0 flex-1 flex flex-col">
                    {/* Product Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/10">
                      {/* Badges */}
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-10 flex flex-col gap-1 sm:gap-2">
                        {product.isNew && (
                          <Badge className="bg-green-500 hover:bg-green-600 text-xs transition-colors">New</Badge>
                        )}
                        {product.isBestseller && (
                          <Badge className="bg-orange-500 hover:bg-orange-600 text-xs transition-colors">Bestseller</Badge>
                        )}
                      </div>

                      {/* Heart Icon - Top Right */}
                      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 z-10">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWishlistToggle(product);
                          }}
                          className={`rounded-full shadow-lg h-8 w-8 sm:h-10 sm:w-10 backdrop-blur-sm hover:scale-110 transition-all duration-200 ${
                            isInWishlist(String(product.id))
                              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-300/50' 
                              : 'bg-white/80 hover:bg-white/90 text-gray-700'
                          }`}
                        >
                          <Heart 
                            className={`h-3 w-3 sm:h-4 sm:w-4 transition-all duration-200 ${
                              isInWishlist(String(product.id)) ? 'fill-current text-white' : 'text-gray-700'
                            }`} 
                          />
                        </Button>
                      </div>

                      {/* Clickable Product Image */}
                      <div
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => handleQuickView(product)}
                      >
                        {Array.isArray(product.images) && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <span className="text-muted-foreground">No image</span>
                          </div>
                        )}
                        
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2 sm:p-3 transform scale-90 group-hover:scale-100 transition-transform duration-200">
                            <span className="text-xs sm:text-sm font-medium text-black">Quick View</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-3 sm:p-4 flex-1 flex flex-col">
                      {/* Product Name - Clickable */}
                      <h3 
                        className="font-semibold text-sm sm:text-base mb-1 sm:mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer"
                        onClick={() => handleQuickView(product)}
                      >
                        {product.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2 sm:mb-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      {/* Colors - Updated for Variants */}
                      <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">Colors:</span>
                        <span className="text-xs text-muted-foreground sm:hidden">Colors:</span>
                        <div className="flex gap-1 sm:gap-1.5">
                          {(() => {
                            // Use variants if available, otherwise fall back to old color system
                            const colors = product.variants && product.variants.length > 0
                              ? product.variants.map((variant: any) => ({
                                  name: variant.colorName,
                                  value: variant.colorValue,
                                  variant: variant
                                }))
                              : typeof product.colors === 'string' 
                                ? JSON.parse(product.colors || '[]') 
                                : product.colors || [];
                              
                            if (!colors || colors.length === 0) {
                              return (
                                <span className="text-xs text-muted-foreground">Default</span>
                              );
                            }
                            
                            const selectedColor = selectedColors[product.id];
                            const maxColors = 3;
                            const visibleColors = colors.slice(0, maxColors);
                            const remainingCount = Math.max(0, colors.length - maxColors);
                            
                            return (
                              <>
                                {visibleColors.map((color: any, colorIndex: number) => {
                                  const isSelected = selectedColor?.name === color.name || 
                                    (!selectedColor && colorIndex === 0);
                                  
                                  return (
                                    <div
                                      key={colorIndex}
                                      className={`group relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer ring-1 ring-gray-200 hover:ring-2 hover:ring-primary/50 ${
                                        isSelected 
                                          ? 'border-primary ring-2 ring-primary/30' 
                                          : 'border-white hover:border-gray-300'
                                      }`}
                                      style={{ backgroundColor: color.value || '#cccccc' }}
                                      title={color.name || 'Color'}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedColors(prev => ({
                                          ...prev,
                                          [product.id]: color
                                        }));
                                      }}
                                    >
                                      {/* Tooltip */}
                                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                        {color.name || 'Color'}
                                      </div>
                                    </div>
                                  );
                                })}
                                {remainingCount > 0 && (
                                  <div className="group relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-white shadow-md hover:shadow-lg hover:scale-110 transition-all duration-200 cursor-pointer ring-1 ring-gray-200 hover:ring-2 hover:ring-primary/50 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">+{remainingCount}</span>
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                                      {remainingCount} more color{remainingCount > 1 ? 's' : ''}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <span className="text-lg sm:text-xl font-bold text-primary">
                          ${product.price}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            const selectedColor = selectedColors[product.id];
                            handleAddToCart(product, selectedColor?.variant);
                          }}
                          className="flex-1 text-xs sm:text-sm py-2 sm:py-3 hover:scale-105 transition-all duration-200"
                          variant="outline"
                          size="sm"
                        >
                          <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Add to Cart
                        </Button>
                        
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!session?.user) {
                              toast.error('Please sign in to order', {
                                description: 'You need to be logged in to place an order',
                                action: {
                                  label: 'Sign In',
                                  onClick: () => router.push('/sign-in'),
                                },
                              });
                              return;
                            }
                            
                            if (!(product as any).sku) {
                              toast.error('Product not available for direct order');
                              return;
                            }
                            
                            // Navigate to checkout with product details
                            const checkoutUrl = `/checkout?product=${product.id}&name=${encodeURIComponent(product.name)}&price=${product.price}&sku=${(product as any).sku}&image=${encodeURIComponent(product.images[0] || '')}`;
                            router.push(checkoutUrl);
                          }}
                          className="flex-1 text-xs sm:text-sm py-2 sm:py-3 hover:scale-105 transition-all duration-200"
                          size="sm"
                        >
                          Order Now
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-12 sm:mt-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline" 
              size="lg" 
              className="px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              onClick={() => router.push('/shop')}
            >
              <motion.span
                className="flex items-center gap-2"
                whileHover={{ x: 5 }}
                transition={{ duration: 0.2 }}
              >
                View All Products
              </motion.span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
