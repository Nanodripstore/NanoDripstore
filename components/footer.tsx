"use client";

import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Shop",
      links: ["All Products", "Hoodies", "T-Shirts", "New Arrivals", "Sale"]
    },
    {
      title: "Support",
      links: ["Contact Us", "Size Guide", "Shipping Info", "Returns", "FAQ"]
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Press", "Blog", "Sustainability"]
    }
  ];

  return (
    <footer className="bg-background border-t border-border/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-4">NanoDrip</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Exclusive streetwear collections designed for the Z-Generation. 
                Quality, innovation, and style that speaks to your individuality.
              </p>
              
              {/* Newsletter */}
              <div className="space-y-4">
                <h4 className="font-semibold">Stay Updated</h4>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter your email" 
                    className="flex-1"
                    type="email"
                  />
                  <Button>Subscribe</Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get the latest drops and exclusive offers
                </p>
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <a 
                      href="#" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col md:flex-row justify-between items-center pt-8 mt-8 border-t border-border/50"
        >
          <div className="text-muted-foreground mb-4 md:mb-0">
            © {currentYear} NanoDrip. All rights reserved.
          </div>
          
          {/* Social Media */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground mr-2">Follow us:</span>
            {[
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Twitter, href: "#", label: "Twitter" },
              { icon: Facebook, href: "#", label: "Facebook" },
            ].map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                className="w-10 h-10 bg-secondary/50 hover:bg-primary hover:text-primary-foreground rounded-full flex items-center justify-center transition-all"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}