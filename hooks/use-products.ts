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

      const response = await fetch(`/api/products/search?${searchParams.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      return response.json();
    },
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
}

export function useProduct(slug: string | null) {
  return useQuery<ProductDetailResponse>({
    queryKey: ['product', slug],
    queryFn: async () => {
      if (!slug) return null;

      const response = await fetch(`/api/products/${slug}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch product');
      }

      return response.json();
    },
    enabled: !!slug, // Only run the query if slug is provided
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
}

// Hook for fetching products from Google Sheets with improved caching
export function useProductsFromSheet({
  query = '',
  category = '',
  page = 1,
  limit = 12,
  sortBy = 'product_id',
  sortOrder = 'asc',
  refresh = false, // Add refresh parameter
}: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  refresh?: boolean;
}) {
  return useQuery<any>({
    queryKey: ['products-sheet', query, category, page, limit, sortBy, sortOrder, refresh],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (query) searchParams.append('query', query);
      if (category) searchParams.append('category', category);
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      searchParams.append('sortBy', sortBy);
      searchParams.append('sortOrder', sortOrder);
      if (refresh) searchParams.append('refresh', 'true'); // Add cache busting
      // Cache busting disabled - image issue resolved
      // Uncomment below if cache issues arise again
      // if (process.env.NODE_ENV === 'production') {
      //   searchParams.append('t', Date.now().toString());
      // }

      const response = await fetch(`/api/products/live?${searchParams.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products from sheet');
      }

      return response.json();
    },
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
}

// New hook for fetching products from Google Sheets with refresh support
export function useProductFromSheet(slug: string | null, refresh: boolean = false) {
  return useQuery<any>({
    queryKey: ['product-sheet', slug, refresh],
    queryFn: async () => {
      if (!slug) return null;

      const searchParams = new URLSearchParams();
      if (refresh) searchParams.append('refresh', 'true');
      // Add timestamp to force fresh data on page reload
      searchParams.append('t', Date.now().toString());

      const response = await fetch(`/api/products/live/${slug}?${searchParams.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch product from sheet');
      }

      return response.json();
    },
    enabled: !!slug, // Only run the query if slug is provided
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  });
}
