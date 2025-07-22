"use client";

import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    id: 1,
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all items. Items must be in original condition with tags attached. Simply contact our customer service team to initiate a return."
  },
  {
    id: 2,
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days within the US. Express shipping (1-2 business days) is available for an additional fee. International shipping takes 7-14 business days."
  },
  {
    id: 3,
    question: "What sizes do you offer?",
    answer: "We offer sizes from XS to XXL for most items. Each product page includes a detailed size chart to help you find the perfect fit. If you're between sizes, we recommend sizing up."
  },
  {
    id: 4,
    question: "How do I care for my ZINZIRA products?",
    question: "How do I care for my NanoDrip products?",
    answer: "For best results, wash in cold water with like colors, tumble dry on low heat, and avoid bleach. Detailed care instructions are included with each item and on the product pages."
  },
  {
    id: 5,
    question: "Do you offer international shipping?",
    answer: "Yes! We ship to over 50 countries worldwide. Shipping costs and delivery times vary by location. International customers are responsible for any customs duties or taxes."
  },
  {
    id: 6,
    question: "How does the 3D preview feature work?",
    answer: "Our 3D preview technology allows you to see products from every angle before purchasing. Simply hover over product images or click the 3D preview button to interact with the model."
  },
  {
    id: 7,
    question: "Can I track my order?",
    answer: "Absolutely! Once your order ships, you'll receive a tracking number via email. You can also track your order status by logging into your account on our website."
  },
  {
    id: 8,
    question: "Do you offer student discounts?",
    answer: "Yes! We offer a 15% student discount. Verify your student status through our partner verification service to receive your discount code."
  }
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      
      {/* FAQ Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Frequently Asked <span className="text-primary">Questions</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Find answers to common questions about our products, shipping, and policies.
          </motion.p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-secondary/20 transition-colors"
                    >
                      <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: openItems.includes(faq.id) ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {openItems.includes(faq.id) ? (
                          <Minus className="w-5 h-5 text-primary" />
                        ) : (
                          <Plus className="w-5 h-5 text-primary" />
                        )}
                      </motion.div>
                    </button>
                    
                    <motion.div
                      initial={false}
                      animate={{
                        height: openItems.includes(faq.id) ? "auto" : 0,
                        opacity: openItems.includes(faq.id) ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
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