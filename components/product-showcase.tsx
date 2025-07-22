"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ShoppingCart, Eye, Palette } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/cart-store';
import { products } from '@/lib/products';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Product3D from './product-3d';
import { toast } from "sonner";


export default function ProductShowcase() {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  const handleAddToCart = (product: typeof products[0]) => {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onHoverStart={() => setHoveredProduct(product.id)}
              onHoverEnd={() => setHoveredProduct(null)}
            >
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  {/* Product Image Container */}
                  <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-secondary/20 to-primary/10">
                    {/* Badges */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {product.isNew && (
                        <Badge className="bg-green-500 hover:bg-green-600">New</Badge>
                      )}
                      {product.isBestseller && (
                        <Badge className="bg-orange-500 hover:bg-orange-600">Bestseller</Badge>
                      )}
                    </div>

                    {/* Product Image/3D Preview */}
                    <AnimatePresence mode="wait">
                      {hoveredProduct === product.id ? (
                        <motion.div
                          key="3d-preview"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <Product3D
                            type={product.type}
                            color={selectedColor || product.colors[0]?.value}
                            className="h-full w-full"
                          />
                        </motion.div>
                      ) : (
                        <motion.img
                          key="product-image"
                          initial={{ opacity: 0, scale: 1.1 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                    </AnimatePresence>

                    {/* Overlay Actions */}
                    <motion.div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="rounded-full shadow-lg h-8 w-8 sm:h-10 sm:w-10"
                          onClick={() => handleQuickView(product)}
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="rounded-full shadow-lg h-8 w-8 sm:h-10 sm:w-10"
                        >
                          <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  </div>

                  {/* Product Details */}
                  <div className="p-4 sm:p-6">
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
                    <h3 className="font-semibold text-base sm:text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl sm:text-2xl font-bold">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-base sm:text-lg text-muted-foreground line-through">
                          ${product.originalPrice}
                        </span>
                      )}
                    </div>

                    {/* Color Options */}
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <div className="flex gap-1">
                        {product.colors.map((color) => (
                          <motion.button
                            key={color.value}
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all ${
                              selectedColor === color.value
                                ? 'border-primary scale-110'
                                : 'border-border hover:border-primary/50'
                            }`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setSelectedColor(color.value)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      className="w-full group/btn text-sm sm:text-base h-9 sm:h-10"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Load More Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <Button variant="outline" size="lg" className="px-8">
            Load More Products
          </Button>
        </motion.div>
      </div>
    </section>
  );
}