"use client";

import { motion } from 'framer-motion';
import { Users, Target, Award, Heart } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

const values = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To create premium streetwear that empowers the Z-Generation to express their unique style and personality."
  },
  {
    icon: Users,
    title: "Community First",
    description: "Building a community of fashion-forward individuals who value quality, authenticity, and self-expression."
  },
  {
    icon: Award,
    title: "Quality Promise",
    description: "Every piece is crafted with the finest materials and undergoes rigorous quality control testing."
  },
  {
    icon: Heart,
    title: "Sustainability",
    description: "Committed to sustainable practices and ethical manufacturing for a better future."
  }
];

export default function About() {
  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      
      {/* About Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            About <span className="text-primary">NanoDrip</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            We're more than just a streetwear brand. We're a movement that celebrates individuality, 
            creativity, and the bold spirit of the Z-Generation.
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Story</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Founded in 2020, NanoDrip emerged from a simple belief: that fashion should be a form of 
                self-expression, not conformity. We started as a small collective of designers and creatives 
                who were tired of the same old fashion formulas.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Today, we're proud to serve thousands of customers worldwide, each one part of our growing 
                community of individuals who dare to be different. Our exclusive collections are designed 
                specifically for the Z-Generation - those who value authenticity, quality, and innovation.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
                alt="Our Story"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do and every piece we create.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background/60 backdrop-blur-sm group hover:scale-105">
                  <CardContent className="p-8 text-center">
                    <motion.div
                      className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <value.icon className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
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