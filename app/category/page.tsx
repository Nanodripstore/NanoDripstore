"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Package, ShoppingBag, Star, TrendingUp } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useCategories } from '@/hooks/use-categories';
import { useEffect, useState } from 'react';

// Enhanced category icons/colors mapping with modern gradients
const getCategoryInfo = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('t-shirt') || name.includes('tshirt') || name.includes('tee')) {
    return {
      icon: '👕',
      bgGradient: 'from-blue-500/20 via-cyan-500/15 to-blue-600/20',
      borderGradient: 'from-blue-400 to-cyan-500',
      iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30',
      description: 'Comfortable and stylish t-shirts for everyday wear',
      badge: 'Popular',
      badgeColor: 'bg-blue-500'
    };
  }
  if (name.includes('hoodie') || name.includes('sweatshirt')) {
    return {
      icon: '🧥',
      bgGradient: 'from-purple-500/20 via-violet-500/15 to-purple-600/20',
      borderGradient: 'from-purple-400 to-violet-500',
      iconBg: 'bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30',
      description: 'Cozy hoodies and sweatshirts for cool weather',
      badge: 'Trending',
      badgeColor: 'bg-purple-500'
    };
  }
  if (name.includes('jacket') || name.includes('varsity')) {
    return {
      icon: '🧥',
      bgGradient: 'from-green-500/20 via-emerald-500/15 to-green-600/20',
      borderGradient: 'from-green-400 to-emerald-500',
      iconBg: 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30',
      description: 'Stylish jackets for the perfect look',
      badge: 'Premium',
      badgeColor: 'bg-green-500'
    };
  }
  if (name.includes('tie-dye') || name.includes('tie dye')) {
    return {
      icon: '🎨',
      bgGradient: 'from-pink-500/20 via-rose-500/15 to-pink-600/20',
      borderGradient: 'from-pink-400 to-rose-500',
      iconBg: 'bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30',
      description: 'Unique tie-dye patterns and designs',
      badge: 'Artistic',
      badgeColor: 'bg-pink-500'
    };
  }
  if (name.includes('oversized')) {
    return {
      icon: '�',
      bgGradient: 'from-orange-500/20 via-amber-500/15 to-orange-600/20',
      borderGradient: 'from-orange-400 to-amber-500',
      iconBg: 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30',
      description: 'Trendy oversized fits for comfort',
      badge: 'Trendy',
      badgeColor: 'bg-orange-500'
    };
  }
  if (name.includes('jubba')) {
    return {
      icon: '🥻',
      bgGradient: 'from-amber-500/20 via-yellow-500/15 to-amber-600/20',
      borderGradient: 'from-amber-400 to-yellow-500',
      iconBg: 'bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30',
      description: 'Traditional and modern jubba styles',
      badge: 'Traditional',
      badgeColor: 'bg-amber-500'
    };
  }
  
  // Default
  return {
    icon: '✨',
    bgGradient: 'from-gray-500/20 via-slate-500/15 to-gray-600/20',
    borderGradient: 'from-gray-400 to-slate-500',
    iconBg: 'bg-gradient-to-br from-gray-100 to-slate-100 dark:from-gray-900/30 dark:to-slate-900/30',
    description: `Explore our ${categoryName} collection`,
    badge: 'New',
    badgeColor: 'bg-gray-500'
  };
};

export default function Category() {
  console.log('🔄 Category page: Component rendering - checking if page was reloaded...');
  
  // Only refresh on actual page reload, not on every render
  const [refreshCategories, setRefreshCategories] = useState(false);
  
  // Fetch categories from Google Sheet - will fetch fresh data on mount due to refetchOnMount: true
  const { data: categories, isLoading, error, refetch } = useCategories(refreshCategories);
  
  // Only trigger refresh on actual page mount (reload/refresh), not on re-renders
  useEffect(() => {
    console.log('🚀 Category page: Page mounted (reloaded/refreshed) - fetching fresh categories');
    // Don't need to call refetch() since refetchOnMount: true will handle it
    // Just log that the page was reloaded
  }, []); // Empty dependency array = run only once on mount (page reload)
  
  console.log('📊 Category page: Hook state:', { 
    categoriesCount: categories?.length, 
    isLoading, 
    hasError: !!error
  });

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      
      {/* Enhanced Category Hero */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-secondary/10 to-transparent rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        
        <div className="container mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
              <Star className="w-3 h-3 mr-1.5" />
              Curated Collections
            </Badge>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
          >
            Shop by <span className="text-primary">Category</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed"
          >
            Discover our carefully curated collections designed for the modern lifestyle. 
            Each category offers unique styles that blend comfort, quality, and contemporary fashion.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center gap-6 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span>Trending Now</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-500" />
              <span>Premium Quality</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>Highly Rated</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modern Categories Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="overflow-hidden border-0 shadow-lg h-full flex flex-col">
                  <CardContent className="p-0 h-full flex flex-col">
                    <Skeleton className="h-48 w-full flex-shrink-0" />
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex-1 flex flex-col justify-start mb-4">
                        <Skeleton className="h-4 w-16 mb-3" />
                        <Skeleton className="h-6 w-3/4 mb-2 min-h-[1.75rem]" />
                        <Skeleton className="h-4 w-full mb-1 min-h-[2.5rem]" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                      <div className="space-y-4 flex-shrink-0">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Failed to load categories</h3>
              <p className="text-muted-foreground mb-4">{error.message}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </motion.div>
          ) : !categories || categories.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-muted/50 rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No categories available</h3>
              <p className="text-muted-foreground">Check back soon for new collections!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
              {categories.map((category, index) => {
                const categoryInfo = getCategoryInfo(category.name);
                
                return (
                  <motion.div
                    key={category.slug}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="h-full"
                  >
                    <Link href={`/category/${category.slug}`} className="block group h-full">
                      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/80 backdrop-blur-sm hover:scale-[1.02] group-hover:-translate-y-1 h-full flex flex-col">
                        <CardContent className="p-0 h-full flex flex-col">
                          {/* Category Header with Icon - Fixed Height */}
                          <div className={`relative h-48 flex-shrink-0 overflow-hidden bg-gradient-to-br ${categoryInfo.bgGradient} border-b`}>
                            {/* Gradient border effect */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${categoryInfo.borderGradient} p-[1px]`}>
                              <div className="w-full h-full bg-background rounded-t-lg" />
                            </div>
                            
                            {/* Background pattern */}
                            <div className="absolute inset-0 opacity-10">
                              <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/20" />
                              <div className="absolute top-8 right-8 w-8 h-8 rounded-full bg-white/15" />
                              <div className="absolute bottom-6 left-8 w-12 h-12 rounded-full bg-white/10" />
                              <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-white/20" />
                            </div>
                            
                            {/* Icon container */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className={`w-20 h-20 rounded-2xl ${categoryInfo.iconBg} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                                <span className="text-4xl">{categoryInfo.icon}</span>
                              </div>
                            </div>
                            
                            {/* Badge */}
                            <div className="absolute top-4 right-4">
                              <Badge className={`${categoryInfo.badgeColor} text-white border-0 text-xs px-2 py-1`}>
                                {categoryInfo.badge}
                              </Badge>
                            </div>
                            
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300" />
                          </div>
                          
                          {/* Content - Flexible Height with Fixed Structure */}
                          <div className="p-6 flex-1 flex flex-col">
                            {/* Top Content */}
                            <div className="flex-1 flex flex-col justify-start mb-4">
                              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-1 min-h-[1.75rem]">
                                {category.name}
                              </h3>
                              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                {categoryInfo.description}
                              </p>
                            </div>
                            
                            {/* Bottom Content - Fixed Height */}
                            <div className="space-y-4 flex-shrink-0">
                              <div className="flex items-center justify-between min-h-[1.25rem]">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Package className="w-4 h-4 flex-shrink-0" />
                                  <span>{category._count?.products || 0} Products</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
                                  <span className="text-xs text-muted-foreground">4.8</span>
                                </div>
                              </div>
                              
                              <Button className="w-full group/btn bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 h-10">
                                <span>Explore Collection</span>
                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </motion.main>
  );
}
