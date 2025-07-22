"use client";

import { motion } from 'framer-motion';
import { Truck, Shield, RotateCcw, Headphones, Palette, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Zap,
    title: '3D Product Preview',
    description: 'Experience our revolutionary 3D preview technology to see products from every angle before purchase.',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Enjoy complimentary shipping on all orders over $75 with our fast and reliable delivery service.',
  },
  {
    icon: Shield,
    title: 'Premium Quality',
    description: 'Each piece is crafted with the finest materials and undergoes rigorous quality control testing.',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    description: 'Not satisfied? Return any item within 30 days for a full refund, no questions asked.',
  },
  {
    icon: Palette,
    title: 'Custom Designs',
    description: 'Personalize your streetwear with our custom design options and color combinations.',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated customer service team is available around the clock to assist you.',
  },
];

export default function Features() {
  return (
    <section className="py-20 px-4 bg-secondary/20">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="text-primary">NanoDrip</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We're committed to delivering the best streetwear experience with innovative technology and exceptional service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
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
                    <feature.icon className="w-8 h-8 text-primary" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}