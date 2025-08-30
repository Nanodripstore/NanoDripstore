import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { StatusCodes } from 'http-status-codes'
import LiveSheetSyncService from '@/lib/live-sheet-sync'
import { convertGoogleDriveUrl } from '@/lib/utils'

// Helper function to process image URLs
function processImageUrls(urls: (string | null | undefined)[], colorVariant?: string): string[] {
  return urls
    .filter((url): url is string => Boolean(url) && url.trim().length > 0)
    .map(url => convertGoogleDriveUrl(url.trim(), colorVariant))
    .filter(Boolean);
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, {
        status: StatusCodes.UNAUTHORIZED
      })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true
      }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: StatusCodes.NOT_FOUND })
    }

    // Get cart items without database product join
    const cartItems = await db.cart_items.findMany({
      where: { userId: user.id }
    })

    console.log('=== CART GET DEBUG ===');
    console.log('Raw cart items from DB:', cartItems.length);

    // Fetch all products from Google Sheets to enrich cart items
    let sheetProducts = [];
    try {
      const syncService = new LiveSheetSyncService()
      const sheetResult = await syncService.getProductsFromSheet({ limit: 1000 })
      sheetProducts = sheetResult.products || []
      console.log('Sheet products loaded for cart enrichment:', sheetProducts.length);
    } catch (error) {
      console.error('Error fetching sheet products for cart:', error);
    }

    // Enrich cart items with sheet data
    const enrichedCartItems = cartItems.map((cartItem: any) => {
      // Find product in sheet data
      let productData = sheetProducts.find((p: any) => p.id === cartItem.productId);
      
      // If not found by ID, try alternative searches
      if (!productData) {
        const searchSlug = cartItem.productId.toString().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        productData = sheetProducts.find((p: any) => {
          if (p.original_id && p.original_id.toString() === cartItem.productId.toString()) {
            return true;
          }
          
          const productSlug = p.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          
          return productSlug === searchSlug || 
                 productSlug.includes(searchSlug) || 
                 p.name.toLowerCase().includes(cartItem.productId.toString().toLowerCase());
        });
      }

      // Use sheet data if available, otherwise fallback to stored cart data
      const finalProductData = productData ? {
        id: productData.id,
        name: productData.name,
        description: productData.description || '',
        price: productData.base_price || productData.price || 0,
        images: productData.images || processImageUrls([
          productData.image_url_1,
          productData.image_url_2,
          productData.image_url_3,
          productData.image_url_4
        ], cartItem.color)
      } : {
        id: cartItem.productId,
        name: cartItem.name || 'Unknown Product',
        description: '',
        price: cartItem.price || 0,
        images: processImageUrls([cartItem.image], cartItem.color)
      };

      // Select the correct image based on the cart item's color
      let selectedImage = finalProductData.images?.[0] || '';
      
      if (cartItem.color && productData && finalProductData.images.length > 1) {
        // First check if there are variants with specific images
        if (productData.variants && Array.isArray(productData.variants)) {
          const matchingVariant = productData.variants.find((variant: any) => 
            variant.colorName === cartItem.color
          );
          
          if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
            selectedImage = matchingVariant.images[0];
          }
        }
        
        // If no variant-specific image found, try to match by color index
        if (selectedImage === finalProductData.images[0]) {
          try {
            // Parse colors from the product data
            let colors = [];
            if (productData.variants && Array.isArray(productData.variants)) {
              colors = productData.variants.map((variant: any) => ({ 
                name: variant.colorName, 
                value: variant.colorValue 
              }));
            } else if (productData.colors) {
              colors = typeof productData.colors === 'string' 
                ? JSON.parse(productData.colors || '[]') 
                : productData.colors || [];
            }
            
            // Find the index of the selected color
            const colorIndex = colors.findIndex((color: any) => color.name === cartItem.color);
            if (colorIndex >= 0 && colorIndex < finalProductData.images.length) {
              selectedImage = finalProductData.images[colorIndex];
            }
          } catch (error) {
            console.log('Error parsing colors for image selection:', error);
          }
        }
      }

      // Debug product data structure
      if (productData) {
        console.log('Sheet product data keys:', Object.keys(productData));
        console.log('Image data check:', {
          hasImages: !!productData.images,
          imagesLength: productData.images?.length || 0,
          firstImage: productData.images?.[0] || 'NO FIRST IMAGE',
          image_url_1: productData.image_url_1 || 'NO URL1',
          image_url_2: productData.image_url_2 || 'NO URL2'
        });
      }

      console.log(`Cart item ${cartItem.productId}: Using ${productData ? 'sheet' : 'cart'} data - ${finalProductData.name}`);
      console.log(`Cart item color-specific image: ${selectedImage || 'NO IMAGE'} for color: ${cartItem.color || 'NO COLOR'}`);

      return {
        ...cartItem,
        // Flatten the product data into the cart item for easy access
        name: finalProductData.name,
        description: finalProductData.description,
        price: finalProductData.price,
        images: finalProductData.images,
        image: selectedImage ? convertGoogleDriveUrl(selectedImage, cartItem.color) : (cartItem.image || ''),
        products: finalProductData
      };
    });

    // Calculate totals using the enriched data
    const subtotal = enrichedCartItems.reduce((sum: number, item: any) => {
      return sum + (item.products.price * item.quantity)
    }, 0)

    return Response.json({
      items: enrichedCartItems,
      subtotal,
      count: enrichedCartItems.length
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const { productId, quantity, size, color, variantId, sku } = await req.json()
    
    console.log('=== CART API POST DEBUG ===');
    console.log('Request data:', { productId, quantity, size, color, variantId, sku });
    console.log('Product ID type:', typeof productId);
    
    if (!productId || quantity === undefined) {
      return Response.json({ error: 'Product ID and quantity are required' }, { status: StatusCodes.BAD_REQUEST })
    }

    if (quantity < 1) {
      return Response.json({ error: 'Quantity must be at least 1' }, { status: StatusCodes.BAD_REQUEST })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true
      }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: StatusCodes.NOT_FOUND })
    }

    // Fetch product from Google Sheets directly (primary source of truth)
    let productFromSheet = null
    console.log(`Fetching product ${productId} from Google Sheets...`)
    try {
      const syncService = new LiveSheetSyncService()
      const sheetResult = await syncService.getProductsFromSheet({ limit: 1000 })
      const sheetProducts = sheetResult.products || []
      
      // Search strategies for finding the product
      // First try to find by ID
      productFromSheet = sheetProducts.find((p: any) => p.id === productId)
      
      // If not found by ID, try to find by original_id, name or slug
      if (!productFromSheet) {
        // Convert productId to potential slug format for searching
        const searchSlug = productId.toString().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        productFromSheet = sheetProducts.find((p: any) => {
          // Check original_id if available
          if (p.original_id && p.original_id.toString() === productId.toString()) {
            return true;
          }
          
          // Create slug from product name
          const productSlug = p.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          
          // Check if slugs match or if the productId matches the original name
          return productSlug === searchSlug || 
                 productSlug.includes(searchSlug) || 
                 p.name.toLowerCase().includes(productId.toString().toLowerCase());
        });
      }
      
      console.log('Sheet products found:', sheetProducts.length);
      console.log('Looking for product ID:', productId);
      console.log('Found sheet products (first 5):', sheetProducts.slice(0, 5).map((p: any) => ({ id: p.id, name: p.name })));
      
      if (!productFromSheet) {
        console.log(`Product ${productId} not found in Google Sheets`)
        return Response.json({ error: 'Product not found' }, { status: StatusCodes.NOT_FOUND })
      }
      
      console.log(`Found product ${productId} in Google Sheets:`, productFromSheet.name)
    } catch (error) {
      console.error('Error fetching from Google Sheets:', error)
      return Response.json({ error: 'Failed to fetch product data' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    // Optional: Check if product exists in database for reference
    const product = await db.products.findUnique({
      where: { id: productId }
    })
    console.log('Database lookup result:', product ? `Found product: ${product.name}` : 'Product not found in DB');

    // Check if item is already in the cart
    const existingCartItem = await db.cart_items.findFirst({
      where: {
        userId: user.id,
        productId,
        ...(size && { size }),
        ...(color && { color }),
        ...(variantId && { variantId })
      }
    })

    let cartItem

    if (existingCartItem) {
      // Update the quantity if item exists
      cartItem = await db.cart_items.update({
        where: { id: existingCartItem.id },
        data: {
          quantity: existingCartItem.quantity + quantity
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              images: true
            }
          }
        }
      })
    } else {
      // Generate unique ID for new cart item
      const uniqueId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      // Use product data from Google Sheets (always fresh data)
      let productDetails = null
      if (productFromSheet) {
        // Use sheet data for products (primary source)
        const images = processImageUrls([
          productFromSheet.image_url_1,
          productFromSheet.image_url_2,
          productFromSheet.image_url_3,
          productFromSheet.image_url_4
        ])
        
        productDetails = {
          name: productFromSheet.name,
          price: productFromSheet.base_price || productFromSheet.price || 0,
          images: images
        }
        console.log('Using sheet data for cart:', productDetails);
      } else if (product) {
        // Fallback to database data if sheet data not available
        productDetails = await db.products.findUnique({
          where: { id: productId },
          select: {
            name: true,
            price: true,
            images: true
          }
        })
        console.log('Using database data for cart:', productDetails);
      }
      
      if (!productDetails) {
        console.log('No product details available');
        return Response.json({ error: 'Product details not found' }, { status: StatusCodes.NOT_FOUND })
      }
      
      // Add new item to cart
      cartItem = await db.cart_items.create({
        data: {
          id: uniqueId,
          userId: user.id,
          productId: productId,
          quantity,
          name: productDetails.name || 'Unknown Product',
          price: productDetails.price || 0,
          image: productDetails.images && productDetails.images.length > 0 ? productDetails.images[0] : '',
          type: 'tshirt', // Default type
          size: size || '',
          color: color || '',
          variantId: variantId ? parseInt(variantId.toString()) : null,
          sku: sku || null,
          updatedAt: new Date()
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              images: true
            }
          }
        }
      })
    }

    return Response.json(cartItem, { 
      status: existingCartItem ? StatusCodes.OK : StatusCodes.CREATED 
    })
  } catch (error) {
    console.error('Error adding item to cart:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const { productId, quantity, size, color, variantId, sku } = await req.json()
    
    console.log('=== CART API PUT DEBUG ===');
    console.log('Request data:', { productId, quantity, size, color, variantId, sku });
    console.log('Product ID type:', typeof productId);
    
    if (!productId || quantity === undefined) {
      return Response.json({ error: 'Product ID and quantity are required' }, { status: StatusCodes.BAD_REQUEST })
    }

    if (quantity < 1) {
      return Response.json({ error: 'Quantity must be at least 1' }, { status: StatusCodes.BAD_REQUEST })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true
      }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: StatusCodes.NOT_FOUND })
    }

    // Fetch product from Google Sheets directly (primary source of truth)
    let productFromSheet = null
    console.log(`Fetching product ${productId} from Google Sheets for update...`)
    try {
      const syncService = new LiveSheetSyncService()
      const sheetResult = await syncService.getProductsFromSheet({ limit: 1000 })
      const sheetProducts = sheetResult.products || []
      
      // Search strategies for finding the product
      productFromSheet = sheetProducts.find((p: any) => p.id === productId)
      
      if (!productFromSheet) {
        // Try alternative search methods
        const searchSlug = productId.toString().toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        productFromSheet = sheetProducts.find((p: any) => {
          if (p.original_id && p.original_id.toString() === productId.toString()) {
            return true;
          }
          
          const productSlug = p.name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          
          return productSlug === searchSlug || 
                 productSlug.includes(searchSlug) || 
                 p.name.toLowerCase().includes(productId.toString().toLowerCase());
        });
      }
      
      if (!productFromSheet) {
        console.log(`Product ${productId} not found in Google Sheets`)
        return Response.json({ error: 'Product not found' }, { status: StatusCodes.NOT_FOUND })
      }
      
      console.log(`Found product ${productId} in Google Sheets for update:`, productFromSheet.name)
    } catch (error) {
      console.error('Error fetching from Google Sheets for update:', error)
      return Response.json({ error: 'Failed to fetch product data' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
    }

    // Find the cart item to update or create
    const existingCartItem = await db.cart_items.findFirst({
      where: {
        userId: user.id,
        productId,
        size: size || '',
        color: color || ''
        // Removed variantId check since we're setting it to null for sheet-based products
      }
    })

    let cartItem

    if (existingCartItem) {
      // Update the quantity if item exists
      cartItem = await db.cart_items.update({
        where: { id: existingCartItem.id },
        data: {
          quantity // Set exact quantity, not adding
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              images: true
            }
          }
        }
      })
    } else {
      // Generate unique ID for new cart item
      const uniqueId = `cart_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      // Get detailed product info
      const productDetails = await db.products.findUnique({
        where: { id: productId },
        select: {
          name: true,
          price: true,
          images: true
        }
      })
      
      if (!productDetails) {
        return Response.json({ error: 'Product details not found' }, { status: StatusCodes.NOT_FOUND })
      }
      
      // Add new item to cart with the required fields
      cartItem = await db.cart_items.create({
        data: {
          id: uniqueId,
          userId: user.id,
          productId: productId,
          quantity,
          name: productDetails.name || 'Unknown Product',
          price: productDetails.price || 0,
          image: productDetails.images && productDetails.images.length > 0 ? productDetails.images[0] : '',
          type: 'tshirt', // Default type
          size: size || '',
          color: color || '',
          variantId: null, // Set to null for sheet-based products to avoid foreign key constraint
          sku: sku || null,
          updatedAt: new Date()
        },
        include: {
          products: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              images: true
            }
          }
        }
      })
    }

    return Response.json(cartItem, { 
      status: existingCartItem ? StatusCodes.OK : StatusCodes.CREATED 
    })
  } catch (error) {
    console.error('Error updating item in cart:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: StatusCodes.UNAUTHORIZED })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true
      }
    })

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: StatusCodes.NOT_FOUND })
    }

    // Check if a specific cart item ID was provided in the URL query
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (id) {
      // Delete specific cart item by ID
      await db.cart_items.delete({
        where: {
          id: id,
          userId: user.id
        }
      })
      
      return Response.json({ message: 'Cart item removed successfully' }, { status: StatusCodes.OK })
    } else {
      // Check if product details are provided in the request body
      try {
        const body = await req.json()
        const { productId, color, size } = body

        if (productId) {
          // Delete specific cart item by product details
          const whereClause: any = {
            userId: user.id,
            productId: productId
          }
          
          if (color) whereClause.color = color
          if (size) whereClause.size = size
          // Removed variantId check since we're setting it to null for sheet-based products

          const deletedItems = await db.cart_items.deleteMany({
            where: whereClause
          })

          return Response.json({ 
            message: 'Cart item removed successfully',
            deletedCount: deletedItems.count 
          }, { status: StatusCodes.OK })
        }
      } catch (error) {
        // If body parsing fails, fall back to clearing all items
        console.log('No specific item details provided, clearing all cart items')
      }

      // Clear all cart items for the user
      await db.cart_items.deleteMany({
        where: { userId: user.id }
      })

      return Response.json({ message: 'Cart cleared successfully' }, { status: StatusCodes.OK })
    }
  } catch (error) {
    console.error('Error clearing cart:', error)
    return Response.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
  }
}
