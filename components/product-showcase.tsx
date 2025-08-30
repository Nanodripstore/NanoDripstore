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
import { SimpleProxiedImage } from '@/components/simple-proxied-image';

export default function ProductShowcase() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartStore();
  const { wishlist, addToWishlist, removeFromWishlistByProductId, isInWishlist, fetchWishlist } = useWishlist();
  const [selectedColors, setSelectedColors] = useState<{ [productId: number]: any }>({});
  const [selectedSizes, setSelectedSizes] = useState<{ [productId: number]: string }>({});
  const [refreshProducts, setRefreshProducts] = useState(process.env.NODE_ENV === 'production'); // Always true in production
  
  // Force refresh on component mount (page reload) - more aggressive in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setRefreshProducts(true);
      // In production, stay in refresh mode longer
      const timer = setTimeout(() => setRefreshProducts(Math.random() < 0.5), 5000); // 50% chance to stay in refresh mode
      return () => clearTimeout(timer);
    } else {
      setRefreshProducts(true);
      // Reset after a short delay to allow normal caching afterward in dev
      const timer = setTimeout(() => setRefreshProducts(false), 1000);
      return () => clearTimeout(timer);
    }
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

  // Initialize first color as default for each product
  useEffect(() => {
    if (data?.products) {
      const newSelectedColors: { [productId: number]: any } = {};
      const newSelectedSizes: { [productId: number]: string } = {};
      
      data.products.forEach((product: any) => {
        // Initialize default color if not already set
        if (!selectedColors[product.id]) {
          // Use variants if available, otherwise fall back to old color system
          if (product.variants && product.variants.length > 0) {
            // Set first variant as default
            const firstVariant = product.variants[0];
            newSelectedColors[product.id] = {
              name: firstVariant.colorName,
              value: firstVariant.colorValue,
              variant: firstVariant
            };
          } else {
            // Fallback to old color system
            const colors = typeof product.colors === 'string' 
              ? JSON.parse(product.colors || '[]') 
              : product.colors || [];
            
            if (colors.length > 0) {
              newSelectedColors[product.id] = colors[0];
            }
          }
        }
        
        // Initialize default size if not already set
        if (!selectedSizes[product.id] && product.sizes && product.sizes.length > 0) {
          // Prefer 'S' size if available, otherwise use first size
          const preferredSize = product.sizes.includes('S') ? 'S' : product.sizes[0];
          newSelectedSizes[product.id] = preferredSize;
        }
      });
      
      // Update colors if we have new ones to set
      if (Object.keys(newSelectedColors).length > 0) {
        setSelectedColors(prev => ({
          ...prev,
          ...newSelectedColors
        }));
      }
      
      // Update sizes if we have new ones to set
      if (Object.keys(newSelectedSizes).length > 0) {
        setSelectedSizes(prev => ({
          ...prev,
          ...newSelectedSizes
        }));
      }
    }
  }, [data?.products]);

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

    // Get selected color and size from state
    const selectedColor = selectedColors[product.id];
    const selectedSize = selectedSizes[product.id];

    console.log('=== ADD TO CART DEBUG ===');
    console.log('Original product:', product);
    console.log('Selected color:', selectedColor);
    console.log('Selected size:', selectedSize);
    console.log('Selected variant:', selectedVariant);

    // Require color and size selection for products with variants
    if (product.variants && product.variants.length > 0 && !selectedColor) {
      toast.error('Please select a color', {
        description: 'You need to select a color before adding to cart',
      });
      return;
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size', {
        description: 'You need to select a size before adding to cart',
      });
      return;
    }

    // Use variants if available, otherwise fall back to old color system
    let colorName, variantId, variantSku, variantPrice;
    
    if (product.variants && product.variants.length > 0) {
      // Use selected variant or first available variant as fallback
      const variant = selectedVariant || selectedColor?.variant || product.variants[0];
      colorName = variant.colorName;
      variantId = variant.id;
      variantSku = variant.sku;
      variantPrice = variant.price || product.price;
      
      console.log('Using variant:', variant);
    } else {
      // Fallback to old color system
      const colors = typeof product.colors === 'string' 
        ? JSON.parse(product.colors || '[]') 
        : product.colors || [];
      colorName = selectedColor?.name || colors[0]?.name || 'Default';
      variantPrice = product.price;
      
      console.log('Using old color system, colors:', colors);
    }

    // Use selected size or fallback to default
    const finalSize = selectedSize || (product.sizes?.includes('S') ? 'S' : product.sizes?.[0]) || 'S';
    
    const cartItem = {
      id: product.id,
      name: product.name,
      price: variantPrice,
      color: colorName,
      size: finalSize,
      image: Array.isArray(product.images) && product.images.length > 0 
        ? product.images[0] 
        : '/placeholder-image.jpg',
      type: product.type as 'tshirt' | 'hoodie',
      variantId: variantId,
      sku: variantSku
    };
    
    console.log('Cart item being added:', cartItem);
    console.log('=== END DEBUG ===');
    
    addItem(cartItem);
    
    toast.success(`Added ${product.name} to cart!`, {
      description: `Color: ${colorName} • Size: ${finalSize} • Price: ₹${variantPrice.toFixed(2)}`,
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
                        {(() => {
                          // Get selected color
                          const selectedColor = selectedColors[product.id];
                          let imageToShow = product.images[0]; // Always start with default image
                          
                          // Only change image if user has explicitly selected a color
                          if (selectedColor) {
                            // If we have a selected color with variant and it has images, use those
                            if (selectedColor.variant?.images && selectedColor.variant.images.length > 0) {
                              imageToShow = selectedColor.variant.images[0];
                            }
                            // If no variant images but we have a selected color, try to find matching image
                            else if (Array.isArray(product.images) && product.images.length > 1) {
                              // Try to find image index based on color selection
                              const colors = product.variants && product.variants.length > 0
                                ? product.variants.map((variant: any) => ({ name: variant.colorName, value: variant.colorValue, variant: variant }))
                                : typeof product.colors === 'string' ? JSON.parse(product.colors || '[]') : product.colors || [];
                              
                              const colorIndex = colors.findIndex((color: any) => color.name === selectedColor.name);
                              if (colorIndex >= 0 && colorIndex < product.images.length) {
                                imageToShow = product.images[colorIndex];
                              }
                            }
                          }
                          
                          return Array.isArray(product.images) && product.images.length > 0 ? (
                            <SimpleProxiedImage
                              src={imageToShow}
                              alt={`${product.name}${selectedColor ? ` - ${selectedColor.name}` : ''}`}
                              className="w-full h-full transition-all duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <span className="text-muted-foreground">No image</span>
                            </div>
                          );
                        })()}
                        
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
                        <div className="flex gap-1 sm:gap-1.5" style={{ isolation: 'isolate' }}>
                          {(() => {
                            // Use variants if available, otherwise fall back to old color system
                            const colors = product.variants && product.variants.length > 0
                              ? (() => {
                                  // Deduplicate colors from variants by color name
                                  const uniqueColors: any[] = [];
                                  const seenColors = new Set();
                                  
                                  product.variants.forEach((variant: any) => {
                                    if (!seenColors.has(variant.colorName)) {
                                      seenColors.add(variant.colorName);
                                      uniqueColors.push({
                                        name: variant.colorName,
                                        value: variant.colorValue,
                                        variant: variant
                                      });
                                    }
                                  });
                                  
                                  return uniqueColors;
                                })()
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
                                  const isSelected = selectedColor?.name === color.name;
                                  
                                  return (
                                    <div
                                      key={colorIndex}
                                      className={`relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 shadow-md transition-all duration-300 cursor-pointer ${
                                        isSelected 
                                          ? 'border-primary scale-110 shadow-primary/30 ring-2 ring-primary/30' 
                                          : 'border-white hover:border-primary/30 hover:ring-2 hover:ring-primary/30 hover:scale-110 hover:shadow-xl'
                                      }`}
                                      style={{ backgroundColor: color.value || '#cccccc' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log('Color clicked:', color.name, 'for product:', product.id);
                                        setSelectedColors(prev => ({
                                          ...prev,
                                          [product.id]: color
                                        }));
                                      }}
                                    >
                                      {/* Inner glow effect on hover */}
                                      <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>
                                  );
                                })}
                                {remainingCount > 0 && (
                                  <div className="relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-white shadow-md transition-all duration-300 cursor-pointer flex items-center justify-center hover:shadow-xl hover:scale-110 hover:ring-2 hover:ring-primary/30 hover:from-primary/10 hover:to-primary/20">
                                    <span className="text-xs font-medium text-gray-600 hover:text-primary transition-colors duration-300 pointer-events-none">+{remainingCount}</span>
                                    
                                    {/* Inner glow effect on hover */}
                                    <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Size Selection */}
                      <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">Size:</span>
                          <span className="text-xs sm:text-sm font-semibold">
                            {selectedSizes[product.id] || 'Select Size'}
                          </span>
                        </div>
                        <div className="flex gap-1 sm:gap-2">
                          {product.sizes?.map((size: string, index: number) => {
                            const isSelected = selectedSizes[product.id] === size;
                            return (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  console.log('Size clicked:', size, 'for product:', product.id);
                                  setSelectedSizes(prev => ({
                                    ...prev,
                                    [product.id]: size
                                  }));
                                }}
                                className={`px-2 py-1 text-xs rounded border transition-all duration-200 ${
                                  isSelected 
                                    ? 'bg-primary text-primary-foreground border-primary' 
                                    : 'bg-background border-border hover:border-primary hover:bg-primary/10'
                                }`}
                              >
                                {size}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <span className="text-lg sm:text-xl font-bold text-primary">
                          ₹{product.price}
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
                            
                            // Get the selected variant or default to first variant
                            let selectedColor = selectedColors[product.id];
                            
                            // If no variant is selected but product has variants, use the first variant as default
                            if (!selectedColor && product.variants && product.variants.length > 0) {
                              const firstVariant = product.variants[0];
                              selectedColor = {
                                name: firstVariant.colorName,
                                value: firstVariant.colorValue,
                                variant: firstVariant,
                                image: firstVariant.images?.[0] || firstVariant.image || product.images[0]
                              };
                            }
                            
                            let orderSku = (product as any).sku;
                            let orderName = product.name;
                            let orderImage = product.images[0] || '';
                            let variantInfo = '';
                            
                            // If a variant is selected or defaulted, use its information
                            if (selectedColor?.variant) {
                              orderSku = selectedColor.variant.sku || orderSku;
                              orderName = `${product.name} - ${selectedColor.name || selectedColor.variant.colorName || selectedColor.variant.name || 'Variant'}`;
                              // Priority: variant.images[0] > variant.image > selectedColor.image > product.images[0]
                              orderImage = selectedColor.variant.images?.[0] || selectedColor.variant.image || selectedColor.image || orderImage;
                              variantInfo = `&variant=${encodeURIComponent(selectedColor.name || selectedColor.variant.colorName || selectedColor.variant.name || 'Variant')}`;
                            }
                            
                            if (!orderSku) {
                              toast.error('Product not available for direct order');
                              return;
                            }
                            
                            // Navigate to checkout with product/variant details
                            const checkoutUrl = `/checkout?product=${product.id}&name=${encodeURIComponent(orderName)}&price=${product.price}&sku=${orderSku}&image=${encodeURIComponent(orderImage)}${variantInfo}`;
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
