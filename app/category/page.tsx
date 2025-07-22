"use client";

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  {
    id: 1,
    name: "Hoodies",
    description: "Premium hoodies for ultimate comfort",
    image: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
    count: "24 Products"
  },
  {
    id: 2,
    name: "T-Shirts",
    description: "Classic and modern t-shirt designs",
    image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg",
    count: "18 Products"
  },
  {
    id: 3,
    name: "Accessories",
    description: "Complete your look with our accessories",
    image: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    count: "12 Products"
  },
  {
    id: 4,
    name: "Limited Edition",
    description: "Exclusive drops and limited collections",
    image: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
    count: "6 Products"
  }
];

export default function Category() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      
      {/* Category Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Shop by <span className="text-primary">Category</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Explore our carefully curated categories designed for the Z-Generation lifestyle.
          </motion.p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-card/50 backdrop-blur-sm hover:scale-105">
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground mb-3">
                        {category.description}
                      </p>
                      <p className="text-sm text-primary font-medium mb-4">
                        {category.count}
                      </p>
                      <Button className="w-full group/btn">
                        Explore Category
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </motion.main>
  );
}