"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, ShoppingCart, Truck, Shield, RotateCcw, ArrowLeft, Plus, Minus, RotateCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { useCartStore } from '@/lib/cart-store';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Product3D from '@/components/product-3d';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from "sonner";
import { Product } from '@/lib/products';

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCartStore();
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0].value);
      setSelectedSize(product.sizes[2]); // Default to M
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!session?.user) {
      toast.error('Please sign in to add items to cart', {
        description: 'You need to be logged in to use the shopping cart',
        action: {
          label: 'Sign In',
          onClick: () => signIn('google'),
        },
      });
      return;
    }

    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    const selectedColorName = product.colors.find(c => c.value === selectedColor)?.name || 'Default';

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        color: selectedColorName,
        size: selectedSize,
        image: product.images[0],
        type: product.type
      });
    }

    toast.success(`Added ${quantity} ${product.name} to cart!`, {
      description: `Color: ${selectedColorName} • Size: ${selectedSize}`,
    });
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Button variant="ghost" onClick={() => router.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image/3D Preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative aspect-square bg-secondary/20 rounded-lg overflow-hidden"
            >
              {show3D ? (
                <Product3D
                  type={product.type}
                  color={selectedColor}
                  className="h-full w-full"
                />
              ) : (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* 360° Button */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg"
                onClick={() => setShow3D(!show3D)}
              >
                <RotateCw className="w-4 h-4 mr-2" />
                {show3D ? 'Photo' : '360°'}
              </Button>
            </motion.div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  onClick={() => {
                    setSelectedImage(index);
                    setShow3D(false); // Switch back to photo view when clicking thumbnail
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-primary' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {product.isNew && <Badge className="bg-green-500">New</Badge>}
                {product.isBestseller && <Badge className="bg-orange-500">Bestseller</Badge>}
              </div>

              {/* Title and Rating */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{product.name}</h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>
            </motion.div>

            {/* Color Selection */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="font-semibold mb-3">Color</h3>
              <div className="flex gap-3 mb-6">
                {product.colors.map((color) => (
                  <motion.button
                    key={color.value}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
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
            </motion.div>

            {/* Size Selection */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="font-semibold mb-3">Size</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className="h-12"
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </motion.div>

            {/* Quantity and Add to Cart */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 h-12 text-base"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12 sm:w-auto">
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="space-y-4"
            >
              <h3 className="font-semibold">Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Shipping Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t"
            >
              {[
                { icon: Truck, text: "Free Shipping" },
                { icon: Shield, text: "2 Year Warranty" },
                { icon: RotateCcw, text: "30-Day Returns" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </motion.main>
  );
}
