import { useQuery } from '@tanstack/react-query';

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

interface Product {
  id: number;
  name: string;
  price: number;
  description: string | null;
  images: string[];
  colors: any; 
  sizes: string[];
  type: string;
  category: string;
  sku?: string; // SKU field for Qikink integration
  isNew: boolean;
  isBestseller: boolean;
  rating: number;
  reviews: number;
  averageRating?: number;
  reviewCount?: number;
  slug?: string;
  variants?: ProductVariant[];
}

interface PaginatedResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

interface ProductDetailResponse extends Product {
  relatedProducts: Product[];
}

export function useProducts({
  query = '',
  category = '',
  page = 1,
  limit = 12,
  sortBy = 'createdAt',
  sortOrder = 'desc',
}: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery<PaginatedResponse>({
    queryKey: ['products', query, category, page, limit, sortBy, sortOrder],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('query', query);
      if (category) searchParams.append('category', category);
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      searchParams.append('sortBy', sortBy);
      searchParams.append('sortOrder', sortOrder);

      const response = await fetch(`/api/products/search?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (increased from 5)
    gcTime: 30 * 60 * 1000, // 30 minutes (increased from 10)
    refetchOnWindowFocus: false,
    retry: 1 // Reduced retry attempts for faster failure
  });
}

export function useProduct(slug: string | null) {
  return useQuery<ProductDetailResponse>({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) return null;

      const response = await fetch(`/api/products/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      return response.json();
    },
    enabled: !!slug, // Only run the query if slug is provided
  });
}

// Hook for fetching products from Google Sheets
export function useProductsFromSheet({
  query = '',
  category = '',
  page = 1,
  limit = 12,
  sortBy = 'product_id',
  sortOrder = 'asc',
}: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery<any>({
    queryKey: ['products-sheet', query, category, page, limit, sortBy, sortOrder],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('query', query);
      if (category) searchParams.append('category', category);
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      searchParams.append('sortBy', sortBy);
      searchParams.append('sortOrder', sortOrder);

      const response = await fetch(`/api/products/live?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products from sheet');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
}

// New hook for fetching products from Google Sheets
export function useProductFromSheet(slug: string | null) {
  return useQuery<any>({
    queryKey: ['product-sheet', slug],
    queryFn: async () => {
      if (!slug) return null;

      const response = await fetch(`/api/products/live/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to fetch product from sheet');
      }

      return response.json();
    },
    enabled: !!slug, // Only run the query if slug is provided
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1
  });
}
