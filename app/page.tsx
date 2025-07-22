"use client";

import { motion } from 'framer-motion';
import Header from '@/components/header';
import Hero from '@/components/hero';
import ProductShowcase from '@/components/product-showcase';
import Features from '@/components/features';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      <Hero />
      <ProductShowcase />
      <Features />
      <Footer />
    </motion.main>
  );
}