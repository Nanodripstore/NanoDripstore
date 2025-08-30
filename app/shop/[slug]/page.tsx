"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useProductFromSheet } from "@/hooks/use-products";
import { useWishlist } from "@/hooks/use-wishlist";
import Link from "next/link";
import OptimizedImage from "@/components/simple-proxied-image";
import { use } from "react";

export default function ProductDetail({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { data: session } = useSession();
  const { addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist, loading: wishlistLoading, wishlist } = useWishlist();
  
  // Get the slug safely whether params is a promise or not
  const slug = typeof params === 'object' && !('then' in params) 
    ? params.slug 
    : use(params as Promise<{ slug: string }>).slug;
    
  const [refreshProduct, setRefreshProduct] = useState(process.env.NODE_ENV === 'production'); // Always true in production
  const { data: product, isLoading, error, refetch } = useProductFromSheet(slug, refreshProduct);
  
  // Force refresh on component mount (page reload) - more aggressive in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      setRefreshProduct(true);
      // In production, stay in refresh mode longer
      const timer = setTimeout(() => setRefreshProduct(Math.random() < 0.5), 5000); // 50% chance to stay in refresh mode
      return () => clearTimeout(timer);
    } else {
      setRefreshProduct(true);
      // Reset after a short delay to allow normal caching afterward in dev
      const timer = setTimeout(() => setRefreshProduct(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [slug]); // Re-run when slug changes

  // Product selection states
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [isImageLoading, setIsImageLoading] = useState<boolean>(false);

  // Set defaults when product loads
  useEffect(() => {
    if (product) {
      // Use variants if available, otherwise fall back to old color system
      if (product.variants && product.variants.length > 0) {
        // Set the first variant (first uploaded) as default
        setSelectedVariant(product.variants[0]);
      } else {
        // Fallback to old color system
        const colors = typeof product.colors === 'string' 
          ? JSON.parse(product.colors || '[]') 
          : product.colors || [];
          
        if (colors.length > 0) {
          setSelectedVariant({ colorName: colors[0].name || "Default", colorValue: colors[0].value });
        }
      }
      
      // Set default size
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  // Show loading when variant changes (color change)
  useEffect(() => {
    if (selectedVariant) {
      setIsImageLoading(true);
      setCurrentImageIndex(0);
    }
  }, [selectedVariant]);

  // Function to get images from the sheet data based on selected variant
  const getProductImages = (product: any, selectedVariant: any) => {
    if (!product) return [];
    
    // If a variant is selected and it has its own images, use those
    if (selectedVariant && selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images.filter((img: string) => img && img.trim().length > 0);
    }
    
    // Fallback to product-level images
    return product.images ? product.images.filter((img: string) => img && img.trim().length > 0) : [];
  };

  // Get current images from the sheet data
  const allPotentialImages = getProductImages(product, selectedVariant);
  const currentImages = allPotentialImages; // Use images directly from sheet data

  // Fetch wishlist when component mounts
  useEffect(() => {
    if (session) {
      fetchWishlist();
    }
  }, [session, fetchWishlist]);

  const handleAddToCart = () => {
    if (!session?.user) {
      toast.error("Please sign in to add items to cart", {
        description: "You need to be logged in to use the shopping cart",
        action: {
          label: "Sign In",
          onClick: () => router.push("/sign-in"),
        },
      });
      return;
    }

    if (!selectedVariant || !selectedSize) {
      toast.error("Please select options", {
        description: "You need to select both color and size before adding to cart",
      });
      return;
    }

    if (product) {
      // Use variant price if available, otherwise use product price
      const itemPrice = selectedVariant.price || product.price;
      const variantSku = selectedVariant.sku || product.sku;
      
      console.log('Adding to cart with quantity:', quantity);
      
      addItem({
        id: product.id,
        name: product.name,
        price: itemPrice,
        color: selectedVariant.colorName || selectedVariant.name || "Default",
        size: selectedSize,
        image: currentImages.length > 0 ? currentImages[0] : "/placeholder.jpg",
        type: product.type === "tshirt" || product.type === "hoodie" ? product.type : "tshirt",
        sku: variantSku
        // Removed variantId since we're setting it to null for sheet-based products
      }, quantity);

      toast.success(`Added ${quantity} × ${product.name} to cart!`, {
        description: `Color: ${selectedVariant.colorName || selectedVariant.name} • Size: ${selectedSize} • Price: ₹${itemPrice.toFixed(2)}`,
      });
    }
  };

  const handleWishlistToggle = async () => {
    if (!session?.user) {
      toast.error("Please sign in to use wishlist", {
        description: "You need to be logged in to save items to your wishlist",
        action: {
          label: "Sign In",
          onClick: () => router.push("/sign-in"),
        },
      });
      return;
    }

    if (!product) return;

    const productInWishlist = isInWishlist(product.id.toString());
    
    if (productInWishlist) {
      // Find the wishlist item to get its ID for removal
      const wishlistItem = wishlist.find(item => item.productId.toString() === product.id.toString());
      
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
      }
    } else {
      await addToWishlist(product.id.toString());
    }
  };

  // If loading, show skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24">
          <Skeleton className="h-8 w-40 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:sticky md:top-24 h-fit">
              <Skeleton className="aspect-square w-full rounded-lg mb-4" />
              <div className="grid grid-cols-4 gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                ))}
              </div>
            </div>
            
            <div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <Skeleton className="h-6 w-1/4 mb-4" />
              <Skeleton className="h-4 w-1/3 mb-6" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              
              <div className="mb-6">
                <Skeleton className="h-5 w-1/4 mb-2" />
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-10 rounded-full" />
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <Skeleton className="h-5 w-1/4 mb-2" />
                <div className="flex gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-16 rounded-md" />
                  ))}
                </div>
              </div>
              
              <Skeleton className="h-12 w-full mb-4" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If error or no product found
  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            Sorry, the product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push("/shop")}>
            Continue Shopping
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  // Parse colors if needed
  const colors = typeof product.colors === 'string' 
    ? JSON.parse(product.colors || '[]') 
    : product.colors || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link href="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to shop
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <div className="md:sticky md:top-24 h-fit">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="aspect-square bg-muted/30 rounded-lg overflow-hidden mb-4 relative"
            >
              {currentImages.length > 0 ? (
                <>
                  <OptimizedImage
                    key={`${selectedVariant?.colorName || 'default'}-${currentImageIndex}`}
                    src={currentImages[currentImageIndex] || currentImages[0]}
                    alt={`${product.name} - ${selectedVariant?.colorName || 'Default'}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      isImageLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={() => setIsImageLoading(false)}
                  />
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/50 backdrop-blur-sm">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="text-sm text-muted-foreground">Loading image...</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <div>No images available</div>
                  </div>
                </div>
              )}
            </motion.div>
            
            {currentImages.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-4 gap-2 mt-4"
              >
                {currentImages.slice(0, 8).map((image: string, i: number) => (
                  <div 
                    key={i} 
                    className={`aspect-square bg-muted/30 rounded-lg overflow-hidden cursor-pointer transition-all ${
                      currentImageIndex === i 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:opacity-90 hover:scale-105'
                    }`}
                    onClick={() => {
                      setIsImageLoading(true);
                      setCurrentImageIndex(i);
                    }}
                    title={`View ${i + 1}`}
                  >
                    <OptimizedImage 
                      src={image} 
                      alt={`${product.name} - ${selectedVariant?.colorName} - view ${i + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                
                {/* Show more indicator if there are more than 8 images */}
                {currentImages.length > 8 && (
                  <div className="aspect-square bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                    +{currentImages.length - 8} more
                  </div>
                )}
              </motion.div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col"
          >
            {/* Product category */}
            <Badge variant="outline" className="w-fit mb-2">
              {product.category}
            </Badge>
            
            {/* Product title */}
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating || 0} ({product.reviews || 0} reviews)
              </span>
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-primary">
                ₹{(selectedVariant?.price || product.price)?.toFixed(2)}
              </span>
              {selectedVariant?.price && selectedVariant.price !== product.price && (
                <span className="text-lg text-muted-foreground line-through">
                  ₹{product.price?.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Description */}
            <p className="text-muted-foreground mb-6">
              {product.description || "No description available for this product."}
            </p>
            
            {/* Color/Variant selection */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">
                Color: {selectedVariant?.colorName || selectedVariant?.name || "Default"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  // Use variants if available, otherwise fall back to old color system
                  const colorOptions = product.variants && product.variants.length > 0
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
                              variant: variant,
                              price: variant.price,
                              sku: variant.sku,
                              stock: variant.stockQuantity,
                              available: variant.isAvailable
                            });
                          }
                        });
                        
                        return uniqueColors;
                      })()
                    : typeof product.colors === 'string' 
                      ? JSON.parse(product.colors || '[]') 
                      : product.colors || [];
                      
                  return colorOptions.map((color: any, i: number) => {
                    const isSelected = selectedVariant?.colorName === color.name || selectedVariant?.name === color.name;
                    const isAvailable = color.available !== false && (color.stock === undefined || color.stock > 0);
                    
                    return (
                      <div
                        key={i}
                        className={`relative w-12 h-12 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center ${
                          isSelected
                            ? "ring-2 ring-primary ring-offset-2"
                            : isAvailable 
                              ? "ring-1 ring-border hover:ring-2 hover:ring-primary/50"
                              : "ring-1 ring-gray-200 opacity-50 cursor-not-allowed"
                        }`}
                        style={{ backgroundColor: color.value || "#ccc" }}
                        onClick={() => {
                          if (isAvailable) {
                            setSelectedVariant(color.variant || { 
                              colorName: color.name, 
                              colorValue: color.value 
                            });
                          }
                        }}
                        title={`${color.name}${color.price ? ` - ₹${color.price.toFixed(2)}` : ''}${!isAvailable ? ' (Out of stock)' : ''}`}
                      >
                        {isSelected && (
                          <Check className="h-5 w-5 text-white drop-shadow-md" />
                        )}
                        {!isAvailable && (
                          <div className="absolute inset-0 bg-white/50 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-gray-600">×</span>
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
              {selectedVariant?.stock !== undefined && (
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : 'Out of stock'}
                </p>
              )}
            </div>
            
            {/* Size selection */}
            {Array.isArray(product.sizes) && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Size: {selectedSize}</h3>
                <RadioGroup 
                  value={selectedSize} 
                  onValueChange={setSelectedSize}
                  className="flex flex-wrap gap-2"
                >
                  {product.sizes.map((size: string) => (
                    <div key={size}>
                      <RadioGroupItem
                        value={size}
                        id={`size-${size}`}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={`size-${size}`}
                        className={`flex h-10 w-16 cursor-pointer items-center justify-center rounded-md border text-sm transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input hover:bg-muted"
                        }`}
                      >
                        {size}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            
            {/* Quantity selection */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Quantity</h3>
              <div className="flex items-center border rounded-md w-fit">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  disabled={quantity <= 1}
                >
                  -
                </Button>
                <span className="w-10 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                className="flex-1 py-6"
                variant="outline"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart (Qty: {quantity})
              </Button>

              <Button
                className="flex-1 py-6"
                onClick={() => {
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
                  
                  if (!selectedVariant || !selectedSize) {
                    toast.error('Please select options', {
                      description: 'You need to select both color and size before ordering',
                    });
                    return;
                  }
                  
                  // Find the specific variant that matches both selected color and size
                  const specificVariant = product.variants?.find((variant: any) => 
                    variant.colorName === selectedVariant.colorName && 
                    variant.size === selectedSize
                  );
                  
                  if (!specificVariant?.sku && !(product as any).sku) {
                    toast.error('Product not available for direct order - SKU missing for this color/size combination');
                    return;
                  }
                  
                  // Use specific variant SKU (color+size) if available, otherwise fall back to selected variant or product SKU
                  const orderSku = specificVariant?.sku || selectedVariant.sku || (product as any).sku;
                  const orderPrice = specificVariant?.price || selectedVariant.price || product.price;
                  
                  // Get the correct image for the selected variant
                  let orderImage = '/placeholder-image.svg'; // Default fallback
                  if (specificVariant?.images && specificVariant.images.length > 0 && specificVariant.images[0].trim() !== '') {
                    // Use specific variant image (color+size specific)
                    orderImage = specificVariant.images[0];
                  } else if (selectedVariant?.images && selectedVariant.images.length > 0 && selectedVariant.images[0].trim() !== '') {
                    // Use selected variant image (color specific)
                    orderImage = selectedVariant.images[0];
                  } else if (currentImages && currentImages.length > 0 && currentImages[0].trim() !== '') {
                    // Use current images being displayed
                    orderImage = currentImages[0];
                  } else if (product.images && product.images.length > 0 && product.images[0].trim() !== '') {
                    // Fall back to product images
                    orderImage = product.images[0];
                  }
                  
                  // Navigate to checkout with product details
                  const checkoutUrl = `/checkout?product=${product.id}&name=${encodeURIComponent(product.name)}&price=${orderPrice}&sku=${orderSku}&image=${encodeURIComponent(orderImage)}&color=${encodeURIComponent(selectedVariant.colorName)}&size=${encodeURIComponent(selectedSize)}`;
                  router.push(checkoutUrl);
                }}
              >
                Order Now
              </Button>
              
              <Button
                variant="outline"
                className="py-6"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
              >
                <Heart 
                  className={`mr-2 h-5 w-5 ${
                    product && isInWishlist(product.id.toString()) 
                      ? 'fill-red-500 text-red-500' 
                      : ''
                  }`} 
                />
                {product && isInWishlist(product.id.toString()) ? 'In Wishlist' : 'Add to Wishlist'}
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                className="h-auto py-3"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Product tabs */}
            <Tabs defaultValue="details" className="mt-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="sizing">Sizing</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="py-4">
                <h3 className="font-medium mb-2">Product Details</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Type: {product.type}</li>
                  <li>Material: Premium cotton blend</li>
                  <li>Care instructions: Machine wash cold</li>
                  <li>Made in USA</li>
                </ul>
              </TabsContent>
              <TabsContent value="sizing" className="py-4">
                <h3 className="font-medium mb-2">Size Guide</h3>
                <p className="text-muted-foreground mb-4">
                  Please refer to the size chart below to find your perfect fit.
                </p>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left">Size</th>
                        <th className="py-2 px-3 text-left">Chest (in)</th>
                        <th className="py-2 px-3 text-left">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 px-3">XS</td>
                        <td className="py-2 px-3">34-36</td>
                        <td className="py-2 px-3">25</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">S</td>
                        <td className="py-2 px-3">36-38</td>
                        <td className="py-2 px-3">26</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">M</td>
                        <td className="py-2 px-3">38-40</td>
                        <td className="py-2 px-3">27</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">L</td>
                        <td className="py-2 px-3">40-42</td>
                        <td className="py-2 px-3">28</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 px-3">XL</td>
                        <td className="py-2 px-3">42-44</td>
                        <td className="py-2 px-3">29</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3">XXL</td>
                        <td className="py-2 px-3">44-46</td>
                        <td className="py-2 px-3">30</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Customer Reviews</h3>
                  <Button variant="outline" size="sm">Write a Review</Button>
                </div>
                
                {product.reviews > 0 ? (
                  <div className="space-y-4">
                    {/* Sample reviews - in a real app, these would come from the API */}
                    <div className="border-b pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-muted mr-2" />
                          <span className="font-medium">John D.</span>
                        </div>
                        <span className="text-xs text-muted-foreground">3 days ago</span>
                      </div>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < 5 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Great product, fits perfectly and the material is really comfortable. 
                        Shipping was fast and the color is exactly as pictured.
                      </p>
                    </div>
                    
                    <div className="border-b pb-4">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-muted mr-2" />
                          <span className="font-medium">Sarah M.</span>
                        </div>
                        <span className="text-xs text-muted-foreground">1 week ago</span>
                      </div>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Love the design and quality. Would recommend sizing up as it runs a bit small.
                        Otherwise perfect!
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Related Products */}
        {product.relatedProducts && product.relatedProducts.length > 0 && (
          <section className="py-12 mt-8">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.relatedProducts.map((related: any) => (
                <Link 
                  href={`/shop/${related.slug}`}
                  key={related.id}
                >
                  <Card className="overflow-hidden h-full hover:border-primary transition-colors">
                    <CardContent className="p-0">
                      <div className="aspect-square bg-muted">
                        {Array.isArray(related.images) && related.images.length > 0 ? (
                          <img 
                            src={related.images[0]} 
                            alt={related.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium truncate">{related.name}</h3>
                        <p className="text-primary font-bold mt-1">₹{related.price?.toFixed(2)}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </motion.div>
  );
}
