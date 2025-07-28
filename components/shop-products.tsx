"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";

export default function ShopProducts() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const { data: session } = useSession();

  const handleAddToCart = (product: typeof products[0]) => {
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
    
    const defaultColor = product.colors[0]?.name || 'Default';
    const defaultSize = product.sizes[2] || 'M'; // Default to M size
    
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      color: defaultColor,
      size: defaultSize,
      image: product.images[0],
      type: product.type
    });
    
    toast.success(`Added ${product.name} to cart!`, {
      description: `Color: ${defaultColor} • Size: ${defaultSize} • Price: $${product.price}`,
    });
  };

  const handleQuickView = (product: typeof products[0]) => {
    router.push(`/product/${product.id}`);
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
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">Full Collection</Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Complete <span className="text-primary">Collection</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Explore our complete range of premium hoodies and t-shirts. 
              Find your perfect style from our carefully curated collection.
            </p>
          </motion.div>

        {/* Product Grid - Show ALL products */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          {products.map((product, index) => (
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
                        className="rounded-full shadow-lg h-8 w-8 sm:h-10 sm:w-10 backdrop-blur-sm bg-white/80 hover:bg-white/90 hover:scale-110 transition-all duration-200"
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Clickable Product Image */}
                    <div
                      className="relative w-full h-full cursor-pointer"
                      onClick={() => handleQuickView(product)}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      
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
                      <span className="text-xs text-muted-foreground">Colors:</span>
                      <div className="flex gap-1">
                        {product.colors.slice(0, 4).map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform cursor-pointer"
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                        {product.colors.length > 4 && (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-200 border-2 border-white shadow-sm flex items-center justify-center">
                            <span className="text-xs text-gray-600">+{product.colors.length - 4}</span>
                          </div>
                        )}
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
                    <Button
                      onClick={() => handleAddToCart(product)}
                      className="w-full mt-auto text-xs sm:text-sm py-2 sm:py-3 hover:scale-105 transition-all duration-200"
                      size="sm"
                    >
                      <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
    </>
  );
}
