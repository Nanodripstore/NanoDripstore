// Override Next.js types for route handlers to fix build issues
declare module 'next/server' {
  export interface RouteHandlerParams {
    params: Record<string, string>;
  }
}

// Product types with variants
interface ProductVariant {
  id: number;
  productId: number;
  colorName: string;
  colorValue: string;
  sku: string;
  price?: number;
  stockQuantity: number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductDetailResponse {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  colors: string | any[];
  sizes: string[];
  type: string;
  category: string;
  sku: string;
  isNew: boolean;
  isBestseller: boolean;
  rating: number;
  reviews: number;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
  slug: string;
  averageRating: number;
  reviewCount: number;
}
