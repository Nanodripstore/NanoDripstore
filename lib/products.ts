export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  type: 'tshirt' | 'hoodie';
  colors: { name: string; value: string }[];
  sizes: string[];
  images: string[];
  description: string;
  features: string[];
  isNew?: boolean;
  isBestseller?: boolean;
  category: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Classic NanoDrip Hoodie",
    price: 89.99,
    originalPrice: 119.99,
    rating: 4.9,
    reviews: 127,
    type: 'hoodie',
    colors: [
      { name: 'Charcoal', value: '#1F2937' },
      { name: 'Royal Blue', value: '#3B82F6' },
      { name: 'Crimson', value: '#EF4444' },
      { name: 'Forest Green', value: '#10B981' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"
    ],
    description: "Ultra-soft basic t-shirt in vibrant colors. Essential wardrobe staple with superior comfort and modern fit.",
    features: [
      "Premium cotton-polyester blend",
      "Adjustable drawstring hood",
      "Kangaroo pocket",
      "Ribbed cuffs and hem",
      "Machine washable"
    ],
    isBestseller: true,
    category: "Hoodies"
  },
  {
    id: 2,
    name: "Urban Street T-Shirt",
    price: 39.99,
    rating: 4.8,
    reviews: 89,
    type: 'tshirt',
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Royal Blue', value: '#3B82F6' },
      { name: 'Crimson', value: '#EF4444' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578764629971-788b76e5a910?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop"
    ],
    description: "Cozy oversized hoodie perfect for layering. Dropped shoulders and relaxed fit for the ultimate comfort experience.",
    features: [
      "100% premium cotton",
      "Pre-shrunk fabric",
      "Reinforced seams",
      "Tagless comfort",
      "Screen-printed graphics"
    ],
    isNew: true,
    category: "T-Shirts"
  },
  {
    id: 3,
    name: "Premium Oversized Hoodie",
    price: 99.99,
    rating: 4.9,
    reviews: 203,
    type: 'hoodie',
    colors: [
      { name: 'Slate Gray', value: '#374151' },
      { name: 'Purple', value: '#7C3AED' },
      { name: 'Amber', value: '#F59E0B' },
      { name: 'Crimson', value: '#EF4444' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=800&fit=crop"
    ],
    description: "Experience ultimate comfort with our premium oversized hoodie. Designed for the modern streetwear enthusiast who values both style and comfort.",
    features: [
      "Oversized relaxed fit",
      "Heavy-weight fleece",
      "Double-lined hood",
      "Reinforced stitching",
      "Premium embroidered logo"
    ],
    category: "Hoodies"
  },
  {
    id: 4,
    name: "Minimalist Logo Tee",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.7,
    reviews: 156,
    type: 'tshirt',
    colors: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Gray', value: '#6B7280' },
      { name: 'Royal Blue', value: '#3B82F6' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop"
    ],
    description: "Clean, minimal design meets premium quality. This essential tee features our subtle logo and is perfect for everyday wear.",
    features: [
      "Soft ring-spun cotton",
      "Minimal branding",
      "Comfortable fit",
      "Durable construction",
      "Versatile styling"
    ],
    category: "T-Shirts"
  },
  {
    id: 5,
    name: "Vintage Washed Hoodie",
    price: 79.99,
    originalPrice: 95.99,
    rating: 4.8,
    reviews: 94,
    type: 'hoodie',
    colors: [
      { name: 'Vintage Black', value: '#2D2D2D' },
      { name: 'Washed Blue', value: '#4A90A4' },
      { name: 'Dusty Rose', value: '#D4A574' },
      { name: 'Sage Green', value: '#87A96B' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"
    ],
    description: "A vintage-inspired hoodie with a perfectly broken-in feel. Features distressed details and washed colors for that authentic streetwear look.",
    features: [
      "Vintage washed finish",
      "Distressed detailing",
      "Soft fleece interior",
      "Relaxed fit",
      "Vintage-style graphics"
    ],
    category: "Hoodies"
  },
  {
    id: 6,
    name: "Graphic Print T-Shirt",
    price: 34.99,
    rating: 4.6,
    reviews: 78,
    type: 'tshirt',
    colors: [
      { name: 'Jet Black', value: '#0F0F0F' },
      { name: 'Heather Gray', value: '#9CA3AF' },
      { name: 'Navy Blue', value: '#1E3A8A' },
      { name: 'Burgundy', value: '#7F1D1D' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f37f4fc9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"
    ],
    description: "Bold graphics meet premium comfort in this statement tee. Perfect for expressing your unique style with eye-catching designs.",
    features: [
      "High-quality screen printing",
      "Vibrant colors",
      "Comfortable crew neck",
      "Pre-shrunk cotton",
      "Unique graphic designs"
    ],
    isNew: true,
    category: "T-Shirts"
  },
  {
    id: 7,
    name: "Tech Fleece Hoodie",
    price: 124.99,
    rating: 4.9,
    reviews: 167,
    type: 'hoodie',
    colors: [
      { name: 'Carbon Black', value: '#1C1C1C' },
      { name: 'Storm Gray', value: '#4B5563' },
      { name: 'Electric Blue', value: '#2563EB' },
      { name: 'Neon Green', value: '#22C55E' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"
    ],
    description: "Next-generation hoodie with advanced tech fleece material. Lightweight yet warm, perfect for active lifestyles and urban adventures.",
    features: [
      "Tech fleece material",
      "Moisture-wicking properties",
      "Lightweight warmth",
      "Athletic fit",
      "Reflective detailing"
    ],
    isBestseller: true,
    category: "Hoodies"
  },
  {
    id: 8,
    name: "Retro Stripe T-Shirt",
    price: 42.99,
    rating: 4.5,
    reviews: 112,
    type: 'tshirt',
    colors: [
      { name: 'Classic White', value: '#FFFFFF' },
      { name: 'Cream', value: '#FEF3C7' },
      { name: 'Light Blue', value: '#BFDBFE' },
      { name: 'Mint Green', value: '#A7F3D0' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"
    ],
    description: "Throwback vibes with modern quality. Features classic stripe patterns and retro-inspired colors for a timeless look.",
    features: [
      "Retro stripe design",
      "Vintage-inspired colors",
      "Soft cotton blend",
      "Classic fit",
      "Ribbed collar"
    ],
    category: "T-Shirts"
  },
  {
    id: 9,
    name: "Zip-Up Hoodie Jacket",
    price: 109.99,
    originalPrice: 129.99,
    rating: 4.7,
    reviews: 143,
    type: 'hoodie',
    colors: [
      { name: 'Midnight Black', value: '#000000' },
      { name: 'Charcoal', value: '#374151' },
      { name: 'Olive Green', value: '#059669' },
      { name: 'Deep Purple', value: '#5B21B6' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=800&fit=crop"
    ],
    description: "Versatile zip-up hoodie that transitions seamlessly from casual to athletic wear. Premium construction meets functional design.",
    features: [
      "Full zip closure",
      "Side pockets",
      "Adjustable hood",
      "Ribbed cuffs and hem",
      "Durable YKK zipper"
    ],
    category: "Hoodies"
  },
  {
    id: 10,
    name: "Essential Basic Tee",
    price: 24.99,
    rating: 4.4,
    reviews: 89,
    type: 'tshirt',
    colors: [
      { name: 'Pure White', value: '#FFFFFF' },
      { name: 'Jet Black', value: '#000000' },
      { name: 'Heather Gray', value: '#D1D5DB' },
      { name: 'Navy', value: '#1E3A8A' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f37f4fc9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop"
    ],
    description: "The perfect everyday tee. Made from premium cotton with a comfortable fit that works for any occasion.",
    features: [
      "100% premium cotton",
      "Classic fit",
      "Reinforced seams",
      "Soft hand feel",
      "Everyday comfort"
    ],
    category: "T-Shirts"
  },
  {
    id: 11,
    name: "Pullover Hood Sweatshirt",
    price: 69.99,
    rating: 4.6,
    reviews: 76,
    type: 'hoodie',
    colors: [
      { name: 'Ash Gray', value: '#6B7280' },
      { name: 'Rust Orange', value: '#EA580C' },
      { name: 'Forest Green', value: '#065F46' },
      { name: 'Burgundy', value: '#991B1B' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop"
    ],
    description: "Classic pullover hoodie with a modern twist. Features premium materials and attention to detail for superior comfort.",
    features: [
      "Pullover design",
      "Front kangaroo pocket",
      "Lined hood",
      "Brushed fleece interior",
      "Embroidered logo"
    ],
    category: "Hoodies"
  },
  {
    id: 12,
    name: "Long Sleeve Henley",
    price: 49.99,
    originalPrice: 59.99,
    rating: 4.5,
    reviews: 68,
    type: 'tshirt',
    colors: [
      { name: 'Charcoal', value: '#374151' },
      { name: 'Cream', value: '#FEF3C7' },
      { name: 'Olive', value: '#65A30D' },
      { name: 'Burgundy', value: '#7F1D1D' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"
    ],
    description: "Sophisticated henley with long sleeves for versatile styling. Perfect for layering or wearing on its own.",
    features: [
      "Long sleeve design",
      "Button-up henley neck",
      "Soft cotton blend",
      "Relaxed fit",
      "Versatile styling"
    ],
    category: "T-Shirts"
  },
  {
    id: 13,
    name: "Athletic Performance Hoodie",
    price: 134.99,
    rating: 4.8,
    reviews: 145,
    type: 'hoodie',
    colors: [
      { name: 'Stealth Black', value: '#1A1A1A' },
      { name: 'Wolf Gray', value: '#6B7280' },
      { name: 'Ocean Blue', value: '#0EA5E9' },
      { name: 'Lime Green', value: '#84CC16' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=800&fit=crop"
    ],
    description: "High-performance hoodie designed for athletes and fitness enthusiasts. Combines comfort with advanced moisture-wicking technology.",
    features: [
      "Moisture-wicking fabric",
      "Quick-dry technology",
      "Anti-odor treatment",
      "Athletic fit",
      "Reflective logo"
    ],
    isNew: true,
    category: "Hoodies"
  },
  {
    id: 14,
    name: "Crew Neck Essential Tee",
    price: 32.99,
    rating: 4.5,
    reviews: 92,
    type: 'tshirt',
    colors: [
      { name: 'Classic White', value: '#FFFFFF' },
      { name: 'Deep Black', value: '#000000' },
      { name: 'Stone Gray', value: '#8B8680' },
      { name: 'Sage Green', value: '#9CAF88' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f37f4fc9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop"
    ],
    description: "Perfect crew neck tee with a modern fit. Essential piece for any wardrobe with premium comfort and style.",
    features: [
      "Crew neck design",
      "Soft cotton jersey",
      "Modern fit",
      "Reinforced collar",
      "Easy care fabric"
    ],
    category: "T-Shirts"
  },
  {
    id: 15,
    name: "Color Block Hoodie",
    price: 94.99,
    originalPrice: 114.99,
    rating: 4.7,
    reviews: 118,
    type: 'hoodie',
    colors: [
      { name: 'Black/Gray', value: '#374151' },
      { name: 'Navy/White', value: '#1E3A8A' },
      { name: 'Green/Black', value: '#059669' },
      { name: 'Red/Gray', value: '#DC2626' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1564557287817-3785e38ec1f5?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=800&h=800&fit=crop"
    ],
    description: "Bold color blocking meets contemporary design. Stand out with this modern take on the classic hoodie silhouette.",
    features: [
      "Color block design",
      "Premium fleece blend",
      "Adjustable drawcord",
      "Front pouch pocket",
      "Contemporary fit"
    ],
    category: "Hoodies"
  },
  {
    id: 16,
    name: "Vintage Wash Pocket Tee",
    price: 38.99,
    rating: 4.6,
    reviews: 87,
    type: 'tshirt',
    colors: [
      { name: 'Faded Black', value: '#2D2D2D' },
      { name: 'Vintage Blue', value: '#4A90A4' },
      { name: 'Washed Green', value: '#87A96B' },
      { name: 'Rust Orange', value: '#D4A574' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop"
    ],
    description: "Vintage-inspired pocket tee with authentic washed finish. Perfect for casual wear with a nostalgic touch.",
    features: [
      "Vintage wash treatment",
      "Front chest pocket",
      "Relaxed fit",
      "Soft hand feel",
      "Authentic vintage look"
    ],
    category: "T-Shirts"
  },
  {
    id: 17,
    name: "Premium Zip Hoodie",
    price: 119.99,
    rating: 4.9,
    reviews: 189,
    type: 'hoodie',
    colors: [
      { name: 'Charcoal Black', value: '#36454F' },
      { name: 'Steel Blue', value: '#4682B4' },
      { name: 'Forest Green', value: '#228B22' },
      { name: 'Burgundy Red', value: '#800020' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1578764629971-788b76e5a910?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop"
    ],
    description: "Premium quality zip-up hoodie with luxury materials and meticulous craftsmanship. The ultimate in comfort and style.",
    features: [
      "Premium zip closure",
      "Luxury fleece lining",
      "Reinforced seams",
      "Embossed logo",
      "Superior construction"
    ],
    isBestseller: true,
    category: "Hoodies"
  },
  {
    id: 18,
    name: "Oversized Graphic Tee",
    price: 44.99,
    originalPrice: 54.99,
    rating: 4.4,
    reviews: 73,
    type: 'tshirt',
    colors: [
      { name: 'Pure White', value: '#FFFFFF' },
      { name: 'Jet Black', value: '#000000' },
      { name: 'Light Gray', value: '#D3D3D3' },
      { name: 'Sand Beige', value: '#F5E6D3' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800&h=800&fit=crop"
    ],
    description: "Trendy oversized tee with bold graphics. Perfect for streetwear enthusiasts who love making a statement.",
    features: [
      "Oversized fit",
      "Bold graphic design",
      "Soft cotton fabric",
      "Drop shoulder style",
      "Contemporary streetwear"
    ],
    category: "T-Shirts"
  }
];

export const getProductById = (id: number): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products;
  return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
};