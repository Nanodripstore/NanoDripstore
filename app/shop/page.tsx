"use client";

import { motion } from 'framer-motion';
import Header from '@/components/header';
import ShopProducts from '@/components/shop-products';
import Features from '@/components/features';
import Footer from '@/components/footer';

export default function Shop() {
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