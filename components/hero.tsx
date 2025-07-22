"use client";

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #374151, #4b5563, #6b7280)' }}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage: "url('https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg')"
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }} />

      <div className="container mx-auto px-4 pt-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="text-left">
          {/* Customer Quote */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <p className="text-sm mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>What our customers says</p>
            <blockquote className="text-lg font-medium" style={{ color: 'white' }}>
              "Easy to use, fast checkout,<br />
              excellent products!"
            </blockquote>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
            style={{ color: 'white' }}
          >
            Exclusive Categories
            <br />
            For Z-Generation
          </motion.h1>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Button 
              size="lg"
              className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 group w-full sm:w-auto"
              style={{ backgroundColor: 'white', color: 'black' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              Shop Now
              <motion.div
                className="ml-2"
                whileHover={{ x: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.div>
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-base sm:text-lg px-6 py-4 sm:px-8 sm:py-6 w-full sm:w-auto"
              style={{ borderColor: 'white', color: 'white', backgroundColor: 'transparent' }}
            >
              Categories
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </motion.div>
        </div>

        {/* Right Content */}
        <div className="relative">
          {/* New Arrivals Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute top-0 right-0 bg-white p-4 rounded-lg shadow-lg max-w-xs"
          >
            <img 
              src="https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg" 
              alt="New Arrival" 
              className="w-full h-32 object-cover rounded mb-3"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-800">Explore New Arrivals</span>
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </div>
          </motion.div>
          
          {/* Scroll Down Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="absolute bottom-8 right-8 text-white/80 text-sm flex items-center gap-2"
            style={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            <span>Scroll Down</span>
            <motion.div
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4 rotate-90" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}