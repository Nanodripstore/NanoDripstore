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
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
      "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
    ],
    description: "Our signature hoodie combines premium comfort with street-ready style. Made from a soft cotton-polyester blend, this hoodie features our iconic NanoDrip logo and is perfect for any casual occasion.",
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
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg",
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
    ],
    description: "A modern take on the classic tee, featuring bold graphics and premium materials. This versatile piece works perfectly for layering or wearing on its own.",
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
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
      "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
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
      "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg",
      "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg",
      "https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg"
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
  }
];

export const getProductById = (id: number): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  if (category === 'all') return products;
  return products.filter(product => product.category.toLowerCase() === category.toLowerCase());
};