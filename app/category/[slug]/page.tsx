"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useCategory } from "@/hooks/use-categories";
import { useWishlist } from "@/hooks/use-wishlist";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";

export default function CategoryPage({ params }: { params: { slug: string } | Promise<{ slug: string }> }) {
  // Get the slug safely whether params is a promise or not
  const slug = typeof params === 'object' && !('then' in params) 
    ? params.slug 
    : use(params as Promise<{ slug: string }>).slug;
  
  const router = useRouter();
  const { data: session } = useSession();
  const { wishlist, addToWishlist, removeFromWishlistByProductId, isInWishlist, fetchWishlist } = useWishlist();
  
  // Convert slug to category name format (e.g., "t-shirts" to "T-Shirts")
  const categoryName = slug.split('-')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
    
  const { data: categoryData, isLoading, error } = useCategory(categoryName);

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

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />

      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto">
          <Link href="/category" className="inline-flex items-center mb-6 text-primary hover:underline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Categories
          </Link>

          {isLoading ? (
            <>
              <Skeleton className="h-12 w-1/2 mb-4" />
              <Skeleton className="h-6 w-3/4 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden border shadow">
                    <CardContent className="p-0">
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-6">
                        <Skeleton className="h-6 w-2/3 mb-2" />
                        <Skeleton className="h-5 w-1/3 mb-4" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-1/4" />
                          <Skeleton className="h-10 w-1/2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : error ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
              <p className="text-muted-foreground mb-6">
                Sorry, we couldn't find the category you're looking for.
              </p>
              <Link href="/category">
                <Button>Browse All Categories</Button>
              </Link>
            </div>
          ) : (
            <>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-bold mb-4"
              >
                {categoryData?.category}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-xl text-muted-foreground mb-8"
              >
                {`Explore our ${categoryData?.category} collection`}
              </motion.p>

              {categoryData?.products && categoryData.products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {categoryData.products.map((product: any, index: number) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Link href={`/shop/${product.name.toLowerCase().replace(/\s+/g, '-')}`} className="block">
                        <Card className="group overflow-hidden border hover:border-primary transition-all duration-300">
                          <CardContent className="p-0">
                            <div className="relative aspect-square overflow-hidden bg-muted">
                              {(() => {
                                const validImages = Array.isArray(product.images) 
                                  ? product.images.filter((img: string) => img && img.trim().length > 0)
                                  : [];
                                
                                return validImages.length > 0 ? (
                                  <img
                                    src={validImages[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-muted-foreground">
                                    No image
                                  </div>
                                );
                              })()}
                              <div className="absolute top-3 right-3 flex gap-2">
                                <Button 
                                  size="icon" 
                                  variant="secondary" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleWishlistToggle(product);
                                  }}
                                  className={`rounded-full w-8 h-8 transition-all duration-200 ${
                                    isInWishlist(String(product.id))
                                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-300/50' 
                                      : 'bg-white/80 hover:bg-white/90 text-gray-700'
                                  }`}
                                >
                                  <Heart 
                                    className={`h-4 w-4 transition-all duration-200 ${
                                      isInWishlist(String(product.id)) ? 'fill-current text-white' : 'text-gray-700'
                                    }`} 
                                  />
                                </Button>
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-medium text-lg mb-1 truncate">{product.name}</h3>
                              <p className="text-primary font-semibold mb-3">
                                ₹{product.price.toFixed(2)}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                  {product.sizes?.length || 0} sizes
                                </span>
                                <Button size="sm" className="gap-1">
                                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/30">
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-6">
                    There are no products in this category yet.
                  </p>
                  <Link href="/shop">
                    <Button>Browse All Products</Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </motion.main>
  );
}
