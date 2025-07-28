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
  description: string | null
  images: string[]
  colors: any
  sizes: string[]
  type: string
  category: string
  isNew: boolean
  isBestseller: boolean
  rating: number
  reviews: number
}

interface CategoryResponse {
  category: string
  products: Product[]
}

// Fetch all categories
export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      return response.json()
    }
  })
}

// Fetch a single category and its products
export function useCategory(categoryName: string | null) {
  return useQuery<CategoryResponse>({
    queryKey: ['category', categoryName],
    queryFn: async () => {
      if (!categoryName) return null
      
      const response = await fetch(`/api/categories?category=${categoryName}`)
      if (!response.ok) {
        throw new Error('Failed to fetch category')
      }
      return response.json()
    },
    enabled: !!categoryName // Only run the query if category is provided
  })
}
