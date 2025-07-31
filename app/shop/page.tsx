"use client";

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/header';
import ShopProducts from '@/components/shop-products';
import Features from '@/components/features';
import Footer from '@/components/footer';

export default function Shop() {
  // Prevent unwanted scroll restoration on page load
  useEffect(() => {
    // Reset scroll position to top on page load
    window.scrollTo(0, 0);
    
    // Disable smooth scrolling temporarily to ensure immediate scroll to top
    const originalScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    // Restore original scroll behavior after a short delay
    const timer = setTimeout(() => {
      document.documentElement.style.scrollBehavior = originalScrollBehavior;
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      <ShopProducts />
      <Features />
      <Footer />
    </motion.main>
  );
}