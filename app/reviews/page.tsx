"use client";

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const reviews = [
  {
    id: 1,
    name: "Alex Chen",
    avatar: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    rating: 5,
    review: "Absolutely love my NanoDrip hoodie! The quality is incredible and the fit is perfect. Fast shipping and excellent customer service.",
    product: "Classic Hoodie",
    date: "2 weeks ago"
  },
  {
    id: 2,
    name: "Maya Rodriguez",
    avatar: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    rating: 5,
    review: "The t-shirt design is so unique and the material feels premium. I've gotten so many compliments wearing it!",
    product: "Urban Street T-Shirt",
    date: "1 month ago"
  },
  {
    id: 3,
    name: "Jordan Kim",
    avatar: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    rating: 5,
    review: "Easy to use website, fast checkout, and excellent products! The 3D preview feature is amazing.",
    product: "Premium Oversized Hoodie",
    date: "3 weeks ago"
  },
  {
    id: 4,
    name: "Sam Taylor",
    avatar: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    rating: 4,
    review: "Great quality streetwear. The sizing is accurate and the colors are exactly as shown online.",
    product: "Minimalist Logo Tee",
    date: "1 week ago"
  },
  {
    id: 5,
    name: "Riley Johnson",
    avatar: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    rating: 5,
    review: "NanoDrip has become my go-to brand for streetwear. Every piece I've bought has exceeded my expectations.",
    product: "Limited Edition Hoodie",
    date: "2 months ago"
  },
  {
    id: 6,
    name: "Casey Wong",
    avatar: "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg",
    rating: 5,
    review: "The attention to detail is incredible. You can really feel the quality in every stitch.",
    product: "Classic T-Shirt",
    date: "3 weeks ago"
  }
];

export default function Reviews() {
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-background"
    >
      <Header />
      
      {/* Reviews Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold mb-6"
          >
            Customer <span className="text-primary">Reviews</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.floor(averageRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({reviews.length} reviews)</span>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            See what our customers are saying about their NanoDrip experience.
          </motion.p>
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-background/60 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar>
                        <AvatarImage src={review.avatar} alt={review.name} />
                        <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{review.name}</h3>
                        <p className="text-sm text-muted-foreground">{review.date}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>

                    <Quote className="w-6 h-6 text-primary/30 mb-2" />
                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {review.review}
                    </p>
                    
                    <div className="text-sm text-primary font-medium">
                      Purchased: {review.product}
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