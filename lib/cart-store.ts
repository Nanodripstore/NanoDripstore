import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image: string;
  type: 'tshirt' | 'hoodie';
  variantId?: number; // Optional variant ID for color variants
  sku?: string; // Store the specific variant SKU
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  currentUserId: string | null;
  isUpdating: boolean;
  debugMode: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeItem: (id: number, color: string, size: string, variantId?: number) => Promise<void>;
  updateQuantity: (id: number, color: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setUser: (userId: string | null) => Promise<void>;
  syncWithDatabase: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  fixCartImages: () => Promise<void>;
  smartSync: () => Promise<void>;
  syncSetQuantityInDatabase: (item: Omit<CartItem, 'quantity'>, quantity: number, retryCount?: number) => Promise<void>;
  syncRemoveFromDatabase: (productId: number, color: string, size: string, retryCount?: number) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      currentUserId: null,
      isUpdating: false,
      debugMode: false,
      addItem: async (newItem, quantity = 1) => {
        // To make UI more responsive, we'll update local state immediately
        // But we'll still use isUpdating to prevent double-clicks within a short timeframe (100ms)
        if (get().isUpdating) return;
        set({ isUpdating: true });
        
        // Use setTimeout to reset the updating flag after a short delay 
        // This provides protection against double-clicks while not blocking the UI
        setTimeout(() => set({ isUpdating: false }), 100);

        const items = get().items;
        const existingItem = items.find(
          item => item.id === newItem.id && 
                  item.color === newItem.color && 
                  item.size === newItem.size
          // Removed variantId comparison since we're not using it for sheet-based products
        );

        // Update local state immediately
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          const updatedItems = items.map(item =>
            item.id === newItem.id && 
            item.color === newItem.color && 
            item.size === newItem.size
            // Removed variantId comparison since we're not using it for sheet-based products
              ? { ...item, quantity: newQuantity }
              : item
          );
          set({ items: updatedItems });
          
          // Update database in background if user is logged in
          const userId = get().currentUserId;
          if (userId) {
            // Don't await this, let it run in background
            get().syncSetQuantityInDatabase(newItem, newQuantity)
              .catch(err => console.error('Background cart sync failed:', err));
          }
        } else {
          const newCartItem = { ...newItem, quantity: quantity };
          set({ items: [...items, newCartItem] });
          
          // Add to database in background if user is logged in
          const userId = get().currentUserId;
          if (userId) {
            // Don't await this, let it run in background
            get().syncSetQuantityInDatabase(newItem, quantity)
              .catch(err => console.error('Background cart sync failed:', err));
          }
        }
      },
      removeItem: async (id, color, size, variantId) => {
        const currentItems = get().items;
        const itemToRemove = currentItems.find(
          item => item.id === id && 
                  item.color === color && 
                  item.size === size
          // Removed variantId comparison since we're not using it for sheet-based products
        );
        
        // Update UI immediately
        set({
          items: currentItems.filter(
            item => !(item.id === id && 
                     item.color === color && 
                     item.size === size)
            // Removed variantId comparison since we're not using it for sheet-based products
          )
        });

        // Remove from database in background if user is logged in
        const userId = get().currentUserId;
        if (userId && itemToRemove) {
          try {
            await get().syncRemoveFromDatabase(id, color, size);
            // Force a sync to ensure consistency
            setTimeout(() => {
              get().syncWithDatabase().catch(err => console.error('Post-removal sync failed:', err));
            }, 100);
          } catch (err) {
            console.error('Failed to remove item from database:', err);
            // If database removal fails, revert the local change
            set({
              items: [...get().items, itemToRemove]
            });
          }
        }
      },
      updateQuantity: async (id, color, size, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id, color, size);
          return;
        }
        
        const oldItems = get().items;
        const itemToUpdate = oldItems.find(item => item.id === id && item.color === color && item.size === size);
        
        // Update local state immediately for responsive UI
        set({
          items: oldItems.map(item =>
            item.id === id && item.color === color && item.size === size
              ? { ...item, quantity }
              : item
          )
        });

        // Update database if user is logged in
        const userId = get().currentUserId;
        if (userId && itemToUpdate) {
          try {
            await get().syncSetQuantityInDatabase(itemToUpdate, quantity);
            // Force a brief sync to ensure consistency
            setTimeout(() => {
              get().syncWithDatabase().catch(err => console.error('Post-update sync failed:', err));
            }, 100);
          } catch (err) {
            console.error('Failed to update quantity in database:', err);
            // If database update fails, revert the local change
            set({
              items: oldItems
            });
          }
        }
      },
      clearCart: async () => {
        // Clear local cart immediately
        set({ items: [] });
        
        // Also clear database cart if user is logged in
        const userId = get().currentUserId;
        if (userId) {
          try {
            const response = await fetch('/api/user/cart', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
              },
              cache: 'no-store'
            });
            
            if (!response.ok) {
              console.error('Failed to clear cart from database');
            }
            
            // Clear the localStorage cart for this user as well
            localStorage.removeItem(`cart-${userId}`);
          } catch (error) {
            console.error('Error clearing cart from database:', error);
          }
        } else {
          // Clear guest cart from localStorage
          localStorage.removeItem('cart-guest');
        }
      },
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
      setUser: async (userId) => {
        const currentUserId = get().currentUserId;
        if (currentUserId !== userId) {
          // Save current cart to localStorage before switching users
          if (currentUserId) {
            const currentCart = get().items;
            localStorage.setItem(`cart-${currentUserId}`, JSON.stringify(currentCart));
          }
          
          set({ currentUserId: userId });
          
          if (userId) {
            // First try to load from localStorage
            const savedCart = localStorage.getItem(`cart-${userId}`);
            if (savedCart) {
              try {
                const parsedCart = JSON.parse(savedCart);
                set({ items: parsedCart });
              } catch (error) {
                console.error('Error loading user cart from localStorage:', error);
                set({ items: [] });
              }
            } else {
              set({ items: [] });
            }
            
            // Then sync with database (this will merge/update with localStorage)
            await get().syncWithDatabase();
          } else {
            // User logged out, load guest cart
            const guestCart = localStorage.getItem('cart-guest');
            if (guestCart) {
              try {
                const parsedCart = JSON.parse(guestCart);
                set({ items: parsedCart });
              } catch (error) {
                console.error('Error loading guest cart:', error);
                set({ items: [] });
              }
            } else {
              set({ items: [] });
            }
          }
        }
      },
      syncWithDatabase: async () => {
        const userId = get().currentUserId;
        if (!userId) {
          console.log('Cart sync skipped: No user ID');
          return;
        }

        console.log('=== CART SYNC WITH DATABASE ===');
        console.log('User ID:', userId);

        try {
          const response = await fetch('/api/user/cart', {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }
          });
          if (response.ok) {
            const data = await response.json();
            // The API returns { items: cartItems[], subtotal, count }
            const dbCartItems = data.items || [];
            
            // Convert database format to store format
            const storeItems: CartItem[] = dbCartItems.map((dbItem: any) => {
              const quantity = parseInt(dbItem.quantity) || 1;
              
              // Try to get the correct color-specific image
              let colorSpecificImage = dbItem.image && dbItem.image.trim() !== '' ? dbItem.image : null;
              
              // If we have product data with variants, try to find the correct color image
              if (dbItem.products && dbItem.color && !colorSpecificImage) {
                const productData = dbItem.products;
                
                // Check if product has variants with images
                if (productData.variants && Array.isArray(productData.variants)) {
                  const matchingVariant = productData.variants.find((variant: any) => 
                    variant.colorName === dbItem.color
                  );
                  
                  if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
                    colorSpecificImage = matchingVariant.images[0];
                    console.log(`Found variant-specific image for ${dbItem.color}:`, colorSpecificImage);
                  }
                }
                
                // If no variant image found, fallback to first available image
                if (!colorSpecificImage && productData.images && productData.images.length > 0) {
                  colorSpecificImage = productData.images[0];
                  console.log(`Using fallback image:`, colorSpecificImage);
                }
              }
              
              return {
                id: dbItem.productId,
                name: dbItem.products?.name || 'Unknown Product',
                price: dbItem.products?.price || 0,
                color: dbItem.color || '',
                size: dbItem.size || '',
                quantity: quantity, // Parse as integer
                image: colorSpecificImage || dbItem.products?.images?.[0] || '', // Use the color-specific image from API
                type: dbItem.type || 'tshirt'
              };
            });
            
            console.log('Converted store items:', storeItems);
            
            // Update both state and localStorage
            set({ items: storeItems });
            localStorage.setItem(`cart-${userId}`, JSON.stringify(storeItems));
          } else {
            console.error('Cart sync failed with status:', response.status);
          }
        } catch (error) {
          console.error('Error syncing cart with database:', error);
        }
      },
      fixCartImages: async () => {
        console.log('=== FIXING CART IMAGES ===');
        const items = get().items;
        
        if (items.length === 0) {
          console.log('No cart items to fix');
          return;
        }
        
        try {
          // Fetch current product data
          const response = await fetch('/api/products/live');
          if (!response.ok) {
            console.error('Failed to fetch products for image fixing');
            return;
          }
          
          const data = await response.json();
          const products = data.products || [];
          
          console.log('Fetched products for image fixing:', products.length);
          
          // Fix each cart item's image
          const fixedItems = items.map(cartItem => {
            // Find the product
            let product = products.find((p: any) => p.id === cartItem.id);
            
            if (!product) {
              console.log(`Product not found for cart item ${cartItem.id}`);
              return cartItem;
            }
            
            console.log(`Fixing image for ${cartItem.name} - ${cartItem.color}`);
            
            // Find the correct variant image for this color
            let correctImage = cartItem.image; // Default to current image
            
            if (product.variants && Array.isArray(product.variants) && cartItem.color) {
              const matchingVariant = product.variants.find((variant: any) => 
                variant.colorName === cartItem.color
              );
              
              if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
                correctImage = matchingVariant.images[0];
                console.log(`Found correct image for ${cartItem.color}: ${correctImage}`);
              } else {
                console.log(`No variant image found for ${cartItem.color}`);
              }
            }
            
            return {
              ...cartItem,
              image: correctImage
            };
          });
          
          console.log('Fixed cart items:', fixedItems);
          
          // Update the cart with fixed images
          set({ items: fixedItems });
          
          // Update localStorage if user is set
          const userId = get().currentUserId;
          if (userId) {
            localStorage.setItem(`cart-${userId}`, JSON.stringify(fixedItems));
          }
          
        } catch (error) {
          console.error('Error fixing cart images:', error);
        }
      },
      smartSync: async () => {
        console.log('=== SMART SYNC ===');
        const userId = get().currentUserId;
        if (!userId) {
          console.log('Smart sync skipped: No user ID');
          return;
        }

        try {
          const response = await fetch('/api/user/cart');
          if (response.ok) {
            const data = await response.json();
            const dbCartItems = data.items || [];
            
            console.log('Smart sync - Raw database cart items:', dbCartItems);
            
            const currentItems = get().items;
            console.log('Smart sync - Current cart items:', currentItems);
            
            // Merge database data with current items, preserving fixed images
            const mergedItems = dbCartItems.map((dbItem: any) => {
              // Find corresponding item in current cart
              const currentItem = currentItems.find(item => 
                item.id === dbItem.productId && 
                item.color === dbItem.color && 
                item.size === dbItem.size
              );
              
              const quantity = parseInt(dbItem.quantity) || 1;
              
              // Use current item's image if it exists (preserves fixes), otherwise use DB image
              const preservedImage = (currentItem?.image && currentItem.image.trim() !== '') 
                ? currentItem.image 
                : (dbItem.image && dbItem.image.trim() !== '') 
                  ? dbItem.image 
                  : '/placeholder-image.svg';
              
              console.log(`Smart sync - Item ${dbItem.productId}-${dbItem.color}: preserving image ${preservedImage}`);
              
              return {
                id: dbItem.productId,
                name: dbItem.products?.name || currentItem?.name || 'Unknown Product',
                price: dbItem.products?.price || currentItem?.price || 0,
                color: dbItem.color || '',
                size: dbItem.size || '',
                quantity: quantity,
                image: preservedImage,
                type: dbItem.type || 'tshirt'
              };
            });
            
            console.log('Smart sync - Merged items:', mergedItems);
            
            // Update state and localStorage
            set({ items: mergedItems });
            localStorage.setItem(`cart-${userId}`, JSON.stringify(mergedItems));
          } else {
            console.error('Smart sync failed with status:', response.status);
          }
        } catch (error) {
          console.error('Error in smart sync:', error);
        }
      },
      forceRefresh: async () => {
        // Force refresh cart from database, ignoring local storage
        const userId = get().currentUserId;
        if (!userId) return;

        try {
          const response = await fetch('/api/user/cart');
          if (response.ok) {
            const data = await response.json();
            const dbCartItems = data.items || [];
            
            console.log('Force refresh - Raw database cart items:', dbCartItems);
            
            const storeItems: CartItem[] = dbCartItems.map((dbItem: any) => {
              const quantity = parseInt(dbItem.quantity) || 1;
              console.log(`Force refresh - Converting DB item: quantity=${dbItem.quantity} (type: ${typeof dbItem.quantity}) -> parsed=${quantity}`);
              console.log(`Force refresh - Item color: ${dbItem.color}, item name: ${dbItem.name}`);
              
              // Try to get the correct color-specific image (same logic as syncWithDatabase)
              let colorSpecificImage = dbItem.image && dbItem.image.trim() !== '' ? dbItem.image : null;
              
              // If we have product data with variants, try to find the correct color image
              if (dbItem.products && dbItem.color && !colorSpecificImage) {
                const productData = dbItem.products;
                
                // Check if product has variants with images
                if (productData.variants && Array.isArray(productData.variants)) {
                  const matchingVariant = productData.variants.find((variant: any) => 
                    variant.colorName === dbItem.color
                  );
                  
                  if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
                    colorSpecificImage = matchingVariant.images[0];
                    console.log(`Force refresh - Found variant-specific image for ${dbItem.color}:`, colorSpecificImage);
                  }
                }
                
                // If no variant image found, fallback to first available image
                if (!colorSpecificImage && productData.images && productData.images.length > 0) {
                  colorSpecificImage = productData.images[0];
                  console.log(`Force refresh - Using fallback image:`, colorSpecificImage);
                }
              }
              
              return {
                id: dbItem.productId,
                name: dbItem.products?.name || 'Unknown Product',
                price: dbItem.products?.price || 0,
                color: dbItem.color || '',
                size: dbItem.size || '',
                quantity: quantity, // Parse as integer
                image: colorSpecificImage || dbItem.products?.images?.[0] || '',
                type: dbItem.type || 'tshirt'
              };
            });
            
            // Update state and localStorage
            set({ items: storeItems });
            localStorage.setItem(`cart-${userId}`, JSON.stringify(storeItems));
          }
        } catch (error) {
          console.error('Error force refreshing cart:', error);
        }
      },
      syncSetQuantityInDatabase: async (item: Omit<CartItem, 'quantity'>, quantity: number, retryCount = 0) => {
        try {
          // Use PUT method to set exact quantity instead of adding
          const response = await fetch('/api/user/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: item.id,
              color: item.color,
              size: item.size,
              // Removed variantId since we're setting it to null for sheet-based products
              sku: item.sku,
              quantity: quantity // Set exact quantity
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.text();
            console.error(`Failed to sync item to database: ${response.status}`, errorData);
            
            // If product not found (404), remove the item from local cart
            if (response.status === 404) {
              console.log('Product not found, removing from local cart:', item);
              get().removeItem(item.id, item.color, item.size, item.variantId);
              return;
            }
            
            // If we get a server error and haven't retried too many times, try again
            if (response.status >= 500 && retryCount < 2) {
              console.log(`Retrying cart sync (attempt ${retryCount + 1})...`);
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
              return get().syncSetQuantityInDatabase(item, quantity, retryCount + 1);
            }
          }
        } catch (error) {
          console.error('Error syncing quantity to database:', error);
          
          // Retry on network errors
          if (retryCount < 2) {
            console.log(`Retrying cart sync after error (attempt ${retryCount + 1})...`);
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
            return get().syncSetQuantityInDatabase(item, quantity);
          }
        }
      },
      syncRemoveFromDatabase: async (productId: number, color: string, size: string, retryCount = 0) => {
        try {
          // Direct approach: find and delete the cart item in one go
          const response = await fetch('/api/user/cart', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId,
              color,
              size
              // Removed variantId since we're setting it to null for sheet-based products
            }),
          });
          
          if (!response.ok) {
            console.error(`Failed to remove item from database: ${response.status}`);
            
            // Retry on server errors
            if (response.status >= 500 && retryCount < 2) {
              console.log(`Retrying cart item removal (attempt ${retryCount + 1})...`);
              await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
              return get().syncRemoveFromDatabase(productId, color, size, retryCount + 1);
            }
          }
        } catch (error) {
          console.error('Error syncing remove from database:', error);
          
          // Retry on network errors
          if (retryCount < 2) {
            console.log(`Retrying cart removal after error (attempt ${retryCount + 1})...`);
            await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
            return get().syncRemoveFromDatabase(productId, color, size, retryCount + 1);
          }
        }
      },
    }),
    {
      name: 'cart-storage-base',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        // Only persist currentUserId, items will be handled separately per user
        currentUserId: state.currentUserId 
      }),
    }
  )
);