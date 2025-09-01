import { StatusCodes } from 'http-status-codes'
import LiveSheetSyncService from '@/lib/live-sheet-sync'

// Function to normalize category names for grouping while preserving original case
const getCategoryInfo = (category: string): { normalized: string, original: string } => {
  if (!category) return { normalized: 'uncategorized', original: 'Uncategorized' }
  
  const normalized = category.toLowerCase().trim()
  const original = category.trim() // Preserve original case
  
  // Handle hoodie variations - return original case but group under same normalized key
  if (normalized.includes('hoodie') || normalized.includes('sweatshirt')) {
    return { normalized: 'hoodies', original }
  }
  
  // Handle t-shirt variations
  if (normalized.includes('t-shirt') || normalized.includes('tshirt') || normalized.includes('tee')) {
    return { normalized: 't-shirts', original }
  }
  
  // Handle jacket variations
  if (normalized.includes('jacket') || normalized.includes('varsity')) {
    return { normalized: 'jackets', original }
  }
  
  // Return normalized version for grouping, original for display
  return { normalized, original }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const cacheBuster = searchParams.get('bust')
    const refresh = searchParams.get('refresh')

    // Simple log to confirm fresh API calls
    console.log(`🔄 API CALL - Categories endpoint hit at ${new Date().toISOString()}`)
    console.log(`📋 Parameters: category=${category}, refresh=${refresh}, cacheBuster=${cacheBuster}`)

    const syncService = new LiveSheetSyncService()
    
    // Clear cache if refresh is requested to ensure fresh data from Google Sheets
    if (refresh === 'true' || cacheBuster) {
      console.log('🗑️ Clearing Google Sheets cache due to refresh request...')
      syncService.clearCache()
      console.log('✅ Google Sheets cache cleared - will fetch fresh data from sheet')
    }

    // Get products from a specific category
    if (category) {
      const { normalized: normalizedRequestedCategory } = getCategoryInfo(category)
      
      const result = await syncService.getProductsFromSheet({ 
        category: '', // Get all products first
        limit: 1000 
      })
      
      // Filter products by normalized category
      const filteredProducts = result.products?.filter(product => {
        const { normalized: productCategory } = getCategoryInfo(product.category || '')
        return productCategory === normalizedRequestedCategory
      }) || []
      
      if (filteredProducts.length === 0) {
        return new Response(JSON.stringify({ error: 'No products found in this category' }), {
          status: StatusCodes.NOT_FOUND,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      return Response.json({
        category: normalizedRequestedCategory,
        products: filteredProducts
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '-1',
          'Surrogate-Control': 'no-store',
          'CDN-Cache-Control': 'no-store',
          'Edge-Control': 'no-store',
          'Vary': '*',
          'Last-Modified': new Date().toUTCString(),
          'ETag': `"${Date.now()}-${Math.random()}"` // Unique ETag every time
        }
      })
    }
    
    // Get all unique categories with product counts
    const allProductsResult = await syncService.getProductsFromSheet({ 
      limit: 10000 // Get all products to analyze categories
    })
    
    const products = allProductsResult.products || []
    
    console.log(`📊 Found ${products.length} products, processing categories...`)
    
    // Extract unique categories and count products - preserve original case for display
    const categoryMap = new Map<string, { count: number, originalName: string }>()
    
    products.forEach((product) => {
      const originalCategory = product.category || 'Uncategorized'
      const { normalized, original } = getCategoryInfo(originalCategory)
      
      const existing = categoryMap.get(normalized)
      if (existing) {
        // Increment count, keep the first original name seen for this normalized category
        categoryMap.set(normalized, { 
          count: existing.count + 1, 
          originalName: existing.originalName 
        })
      } else {
        // First time seeing this normalized category, use the original name
        categoryMap.set(normalized, { count: 1, originalName: original })
      }
    })
    
    console.log(`📈 Final categories:`, Object.fromEntries(
      Array.from(categoryMap.entries()).map(([key, value]) => [key, { count: value.count, displayName: value.originalName }])
    ))
    
    // Convert to array format expected by the frontend - use original names for display
    const categoriesWithCount = Array.from(categoryMap.entries()).map(([normalizedName, { count, originalName }]) => ({
      name: originalName, // Use original case from Google Sheet
      slug: normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      _count: { products: count }
    })).sort((a, b) => a.name.localeCompare(b.name))
    
    console.log(`📤 Returning categories to frontend:`, JSON.stringify(categoriesWithCount, null, 2))
    
    return Response.json(categoriesWithCount, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '-1',
        'Surrogate-Control': 'no-store',
        'CDN-Cache-Control': 'no-store',
        'Edge-Control': 'no-store',
        'Vary': '*',
        'Last-Modified': new Date().toUTCString(),
        'ETag': `"${Date.now()}-${Math.random()}"` // Unique ETag every time
      }
    })
  } catch (error) {
    console.error('Error fetching categories from Google Sheets:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
