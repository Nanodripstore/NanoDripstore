import { useQuery } from '@tanstack/react-query'

interface Category {
  name: string
  slug: string
  _count: {
    products: number
  }
}

interface Product {
  id: number
  name: string
  price: number
  base_price?: number
  description: string | null
  images: string[]
  colors: any
  sizes: string[]
  type: string
  category: string
  isNew: boolean
  isBestseller: boolean
  is_new?: boolean
  is_bestseller?: boolean
  rating: number
  reviews: number
  variants?: any[]
  image_url_1?: string
  image_url_2?: string
  image_url_3?: string
  image_url_4?: string
}

interface CategoryResponse {
  category: string
  products: Product[]
}

// Fetch all categories from Google Sheets with refresh support (like useProductsFromSheet)
export function useCategories(refresh: boolean = false) {
  return useQuery<Category[]>({
    queryKey: ['categories-sheet', refresh], // Static key - only changes when refresh changes
    queryFn: async () => {
      console.log('🔄 useCategories: Starting fresh fetch from Google Sheets category column...');
      
      const searchParams = new URLSearchParams();
      if (refresh) searchParams.append('refresh', 'true');
      // Add timestamp to force fresh data on page reload
      searchParams.append('t', Date.now().toString());
      // Add cache buster to force fresh fetch from Google Sheets
      searchParams.append('bust', Math.random().toString());
      
      const response = await fetch(`/api/categories?${searchParams.toString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories from sheet');
      }
      
      const data = await response.json();
      console.log('✅ useCategories: Received fresh category data from sheet:', data);
      return data;
    },
    enabled: true, // Always enabled
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache results
    refetchOnMount: true, // Only refetch when component mounts (page reload)
    refetchOnWindowFocus: false, // Disable to prevent extra calls
    refetchOnReconnect: false, // Disable to prevent extra calls
    retry: false // Don't retry to avoid delays
  });
}

// Fetch a single category and its products
export function useCategory(categoryName: string | null) {
  return useQuery<CategoryResponse>({
    queryKey: ['category', categoryName],
    queryFn: async () => {
      if (!categoryName) return null
      
      const response = await fetch(`/api/categories?category=${encodeURIComponent(categoryName)}&t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch category')
      }
      return response.json()
    },
    enabled: !!categoryName, // Only run the query if category is provided
    staleTime: 0, // Always refetch
    gcTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true
  })
}
