"use client";

import { motion } from 'framer-motion';
import Header from '@/components/header';
import ProductShowcase from '@/components/product-showcase';
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
      
      {/* Shop Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Shop <span className="text-primary">Collection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Discover our complete range of premium streetwear designed for the modern generation.
          </motion.p>
        </div>
      </section>

      <ProductShowcase />
      <Features />
      <Footer />
    </motion.main>
  );
}