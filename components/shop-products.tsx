"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { useWishlist } from '@/hooks/use-wishlist';
import { useProductsFromSheet } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import OptimizedImage from '@/components/ui/optimized-image';
import Link from 'next/link';

export default function ShopProducts() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { data: session } = useSession();
  const { wishlist, addToWishlist, removeFromWishlistByProductId, isInWishlist, fetchWishlist } = useWishlist();

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
  
  // States for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOption, setSortOption] = useState('createdAt:desc');
  const [refreshProducts, setRefreshProducts] = useState(process.env.NODE_ENV === 'production'); // Always true in production
  const [selectedColors, setSelectedColors] = useState<{ [productId: number]: any }>({});
  
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
  
  // Parse sort option
  const [sortBy, sortOrder] = sortOption.split(':');

  // Fetch products from Google Sheet using optimized hook
  const { data, isLoading, error, refetch } = useProductsFromSheet({
    query: searchQuery,
    category: selectedCategory !== 'all' ? selectedCategory : '',
    sortBy,
    sortOrder,
    limit: 20, // Increased limit for shop page
    refresh: refreshProducts
  });

  // Extract categories from fetched data
  const categories = useMemo(() => {
    if (data?.products && Array.isArray(data.products)) {
      const uniqueCategories = [...new Set(data.products.map((p: any) => p?.category) || [])];
      return uniqueCategories.map(cat => ({ name: cat, slug: cat }));
    }
    return [];
  }, [data?.products]);

  // Force recompilation with a comment change - updated

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
    
    // Get selected color or use default
    const selectedColor = selectedColors[product.id];
    let colorName = 'Default';
    let productImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '/placeholder.jpg';
    
    // Use variant info if available
    if (selectedVariant) {
      colorName = selectedVariant.colorName || 'Default';
      if (selectedVariant.images && selectedVariant.images.length > 0) {
        productImage = selectedVariant.images[0];
      }
    } else if (selectedColor) {
      colorName = selectedColor.name || 'Default';
      // If variant has images, use those
      if (selectedColor.variant?.images && selectedColor.variant.images.length > 0) {
        productImage = selectedColor.variant.images[0];
      }
      // Otherwise try to find matching image by color index
      else if (Array.isArray(product.images) && product.images.length > 1) {
        const colors = product.variants && product.variants.length > 0
          ? product.variants.map((variant: any) => ({ name: variant.colorName, value: variant.colorValue, variant: variant }))
          : typeof product.colors === 'string' ? JSON.parse(product.colors || '[]') : product.colors || [];
        
        const colorIndex = colors.findIndex((color: any) => color.name === selectedColor.name);
        if (colorIndex >= 0 && colorIndex < product.images.length) {
          productImage = product.images[colorIndex];
        }
      }
    } else {
      // Parse JSON colors if it's a string for default
      let colors = [];
      try {
        colors = typeof product.colors === 'string' 
          ? JSON.parse(product.colors || '[]') 
          : product.colors || [];
      } catch (error) {
        console.error('Error parsing product colors for cart:', error);
        colors = [];
      }
      colorName = colors[0]?.name || 'Default';
    }
    
    const defaultSize = product.sizes?.[0] || 'M'; // Default to first size or M
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      color: colorName,
      size: defaultSize,
      image: productImage,
      type: product.type
    });
    
    toast.success(`Added ${product.name} to cart!`, {
      description: `Color: ${colorName} • Size: ${defaultSize} • Price: $${product.price}`,
    });
  };

  const handleQuickView = (product: any) => {
    // Create a slug from product name
    const slug = product.name.toLowerCase().replace(/\s+/g, '-');
    router.push(`/shop/${slug}`);
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
  
  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already handled by the state change
  };

  return (
    <>
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <Badge variant="outline" className="mb-4">Full Collection</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Complete <span className="text-primary">Collection</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Explore our complete range of premium hoodies and t-shirts. 
              Find your perfect style from our carefully curated collection.
            </p>
            
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-center max-w-4xl mx-auto mb-8">
              <form onSubmit={handleSearchSubmit} className="relative flex-grow max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
              
              <div className="flex gap-2 w-full md:w-auto">
                <Select 
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.name} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={sortOption}
                  onValueChange={setSortOption}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt:desc">Newest First</SelectItem>
                    <SelectItem value="price:asc">Price: Low to High</SelectItem>
                    <SelectItem value="price:desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating:desc">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden border-0 shadow-md bg-card/50 h-full">
                <CardContent className="p-0 flex-1 flex flex-col">
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 sm:p-4">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-24 mb-3" />
                    <Skeleton className="h-4 w-1/3 mb-3" />
                    <Skeleton className="h-6 w-1/2 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">Failed to load products</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : data?.products?.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-muted/30">
            <h3 className="text-xl font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try changing your search criteria or browse our categories.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
              }}>Clear Filters</Button>
              <Link href="/category">
                <Button variant="outline">Browse Categories</Button>
              </Link>
            </div>
          </div>
        ) : data?.products && data?.products?.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            {data?.products?.map((product: any, index: number) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.5,
                  delay: index * 0.04, // Reduced delay for larger grid
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
                        // Get selected color or default to first variant/color
                        const selectedColor = selectedColors[product.id];
                        let imageToShow = product.images[0]; // Default image
                        
                        // If we have a selected color with variant and it has images, use those
                        if (selectedColor?.variant?.images && selectedColor.variant.images.length > 0) {
                          imageToShow = selectedColor.variant.images[0];
                        }
                        // If no variant images but we have a selected color, try to find matching image
                        else if (selectedColor && Array.isArray(product.images) && product.images.length > 1) {
                          // Try to find image index based on color selection
                          const colors = product.variants && product.variants.length > 0
                            ? product.variants.map((variant: any) => ({ name: variant.colorName, value: variant.colorValue, variant: variant }))
                            : typeof product.colors === 'string' ? JSON.parse(product.colors || '[]') : product.colors || [];
                          
                          const colorIndex = colors.findIndex((color: any) => color.name === selectedColor.name);
                          if (colorIndex >= 0 && colorIndex < product.images.length) {
                            imageToShow = product.images[colorIndex];
                          }
                        }
                        
                        return Array.isArray(product.images) && product.images.length > 0 ? (
                          <OptimizedImage
                            src={imageToShow}
                            alt={`${product.name} - ${selectedColor?.name || 'Default'}`}
                            className="w-full h-full transition-all duration-500 group-hover:scale-105"
                            key={`${product.id}-${selectedColor?.name || 'default'}`} // Key for smooth transitions
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

                    {/* Colors */}
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
                            
                          if (!colors || !Array.isArray(colors) || colors.length === 0) {
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
                                    className={`group relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full border-2 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ring-1 ring-gray-200/50 ${
                                      isSelected 
                                        ? 'border-primary ring-2 ring-primary/50 scale-110 shadow-primary/30' 
                                        : 'border-white hover:border-primary/30 hover:ring-2 hover:ring-primary/30 hover:scale-110'
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
                                    {/* Selection indicator */}
                                    {isSelected && (
                                      <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse" />
                                    )}
                                    
                                    {/* Inner glow effect on hover */}
                                    <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 font-medium">
                                      {color.name || 'Color'}
                                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/90"></div>
                                    </div>
                                  </div>
                                );
                              })}
                              {remainingCount > 0 && (
                                <div className="group relative w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 border-2 border-white shadow-md hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer ring-1 ring-gray-200/50 hover:ring-2 hover:ring-primary/30 flex items-center justify-center hover:from-primary/10 hover:to-primary/20">
                                  <span className="text-xs font-medium text-gray-600 group-hover:text-primary transition-colors duration-300">+{remainingCount}</span>
                                  
                                  {/* Inner glow effect on hover */}
                                  <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                  
                                  {/* Tooltip */}
                                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 font-medium">
                                    {remainingCount} more color{remainingCount > 1 ? 's' : ''}
                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-black/90"></div>
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
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart Button */}
                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          // Provide immediate visual feedback on click
                          const button = e.currentTarget;
                          
                          // Check if button is already in "adding" state
                          if (button.getAttribute('data-adding') === 'true') {
                            return;
                          }
                          
                          // Store original content and mark button as adding
                          const originalContent = `<svg class="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>Add to Cart`;
                          button.setAttribute('data-adding', 'true');
                          
                          // Update button appearance
                          button.innerHTML = `
                            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span class="ml-2">Added!</span>
                          `;
                          
                          // Call actual handler
                          const selectedColor = selectedColors[product.id];
                          handleAddToCart(product, selectedColor?.variant);
                          
                          // Restore button after animation
                          setTimeout(() => {
                            button.innerHTML = originalContent;
                            button.setAttribute('data-adding', 'false');
                          }, 1000);
                        }}
                        className="flex-1 text-xs sm:text-sm py-2 sm:py-3 hover:scale-105 transition-all duration-200"
                        variant="outline"
                        size="sm"
                        data-adding="false"
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
                          
                          if (!product.sku) {
                            toast.error('Product not available for direct order');
                            return;
                          }
                          
                          // Navigate to checkout with product details
                          const checkoutUrl = `/checkout?product=${product.id}&name=${encodeURIComponent(product.name)}&price=${product.price}&sku=${product.sku}&image=${encodeURIComponent(product.images[0] || '')}`;
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
          ))}
        </motion.div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No products available</div>
            <div className="text-gray-400 text-sm">Please check back later</div>
          </div>
        )}
        
        {/* Pagination */}
        {data?.pagination && data?.pagination?.pages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="flex gap-2">
              {[...Array(data?.pagination?.pages || 1)].map((_, i) => (
                <Button
                  key={i}
                  variant={data?.pagination?.current === i + 1 ? "default" : "outline"}
                  size="sm"
                  className="w-10 h-10"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
    </>
  );
}
