"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from "sonner";


export default function ProductShowcase() {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartStore();
  const [selectedColor, setSelectedColor] = useState<string>('');

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
          {products.slice(0, 6).map((product, index) => (
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
                        className="rounded-full shadow-lg h-8 w-8 sm:h-10 sm:w-10 backdrop-blur-sm bg-white/80 hover:bg-white/90 hover:scale-110 transition-all duration-200"
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>

                    {/* Clickable Product Image */}
                    <div
                      className="h-full w-full cursor-pointer"
                      onClick={() => handleQuickView(product)}
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading={index < 4 ? "eager" : "lazy"}
                      />
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-3 sm:p-4 lg:p-6 flex-1 flex flex-col">
                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 sm:w-4 sm:h-4 ${
                            i < Math.floor(product.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs sm:text-sm text-muted-foreground ml-1">
                        ({product.reviews})
                      </span>
                    </div>

                    {/* Product Name */}
                    <h3 
                      className="font-semibold text-sm sm:text-base lg:text-lg mb-2 group-hover:text-primary transition-all line-clamp-2 flex-1 cursor-pointer hover:scale-[1.01] duration-200"
                      onClick={() => handleQuickView(product)}
                    >
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <span className="text-lg sm:text-xl lg:text-2xl font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm sm:text-base lg:text-lg text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Color Options */}
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <div className="flex gap-1 sm:gap-2">
                        {product.colors.map((color) => (
                          <button
                            key={color.value}
                            className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full border-2 transition-all duration-200 hover:scale-110 ${
                              selectedColor === color.value
                                ? 'border-primary scale-110'
                                : 'border-border hover:border-primary/50'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setSelectedColor(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full group/btn text-xs sm:text-sm lg:text-base h-8 sm:h-9 lg:h-10 bg-primary/90 hover:bg-primary hover:scale-[1.02] transition-all duration-200 mt-auto"
                      onClick={(e) => {
                        // Provide immediate visual feedback on click
                        const button = e.currentTarget;
                        
                        // Check if button is already in "adding" state
                        if (button.getAttribute('data-adding') === 'true') {
                          return;
                        }
                        
                        // Store original content and mark button as adding
                        const originalContent = `<svg class="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>Add to Cart`;
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
                        handleAddToCart(product);
                        
                        // Restore button after animation
                        setTimeout(() => {
                          button.innerHTML = originalContent;
                          button.setAttribute('data-adding', 'false');
                        }, 1000);
                      }}
                      data-adding="false"
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover/btn:rotate-12 transition-transform duration-300" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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