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
import { useProduct } from "@/hooks/use-products";
import Link from "next/link";
import { use } from "react";

export default function ProductDetail({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { data: session } = useSession();
  
  // Get the slug safely whether params is a promise or not
  const slug = typeof params === 'object' && !('then' in params) 
    ? params.slug 
    : use(params as Promise<{ slug: string }>).slug;
    
  const { data: product, isLoading, error } = useProduct(slug);

  // Product selection states
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  // Set defaults when product loads
  useEffect(() => {
    if (product) {
      // Parse colors if needed
      const colors = typeof product.colors === 'string' 
        ? JSON.parse(product.colors || '[]') 
        : product.colors || [];
        
      if (colors.length > 0) {
        setSelectedColor(colors[0].name || "Default");
      }
      
      // Set default size
      if (Array.isArray(product.sizes) && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
    }
  }, [product]);

  // Smooth scroll to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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

    if (!selectedColor || !selectedSize) {
      toast.error("Please select options", {
        description: "You need to select both color and size before adding to cart",
      });
      return;
    }

    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.price,
          color: selectedColor,
          size: selectedSize,
          image: Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : "/placeholder.jpg",
          type: product.type === "tshirt" || product.type === "hoodie" ? product.type : "tshirt",
        });
      }

      toast.success(`Added ${quantity} × ${product.name} to cart!`, {
        description: `Color: ${selectedColor} • Size: ${selectedSize} • Price: $${product.price.toFixed(2)}`,
      });
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
              className="aspect-square bg-muted/30 rounded-lg overflow-hidden mb-4"
            >
              {Array.isArray(product.images) && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No image available
                </div>
              )}
            </motion.div>
            
            {Array.isArray(product.images) && product.images.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-4 gap-2"
              >
                {product.images.slice(0, 4).map((image, i) => (
                  <div key={i} className="aspect-square bg-muted/30 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                    <img src={image} alt={`${product.name} - view ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
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
                ${product.price?.toFixed(2)}
              </span>
            </div>
            
            {/* Description */}
            <p className="text-muted-foreground mb-6">
              {product.description || "No description available for this product."}
            </p>
            
            {/* Color selection */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Color: {selectedColor}</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color: any, i: number) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center ${
                      selectedColor === color.name
                        ? "ring-2 ring-primary ring-offset-2"
                        : "ring-1 ring-border hover:ring-2 hover:ring-primary/50"
                    }`}
                    style={{ backgroundColor: color.value || "#ccc" }}
                    onClick={() => setSelectedColor(color.name)}
                    title={color.name}
                  >
                    {selectedColor === color.name && (
                      <Check className="h-5 w-5 text-white drop-shadow-md" />
                    )}
                  </div>
                ))}
              </div>
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
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="py-6"
              >
                <Heart className="mr-2 h-5 w-5" />
                Wishlist
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-auto py-6"
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
                        <p className="text-primary font-bold mt-1">${related.price?.toFixed(2)}</p>
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
