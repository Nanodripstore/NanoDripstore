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
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  currentUserId: string | null;
  isUpdating: boolean;
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (id: number, color: string, size: string) => Promise<void>;
  updateQuantity: (id: number, color: string, size: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  setUser: (userId: string | null) => Promise<void>;
  syncWithDatabase: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  syncSetQuantityInDatabase: (item: Omit<CartItem, 'quantity'>, quantity: number) => Promise<void>;
  syncRemoveFromDatabase: (productId: number, color: string, size: string, retryCount?: number) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      currentUserId: null,
      isUpdating: false,
      addItem: async (newItem) => {
        // To make UI more responsive, we'll update local state immediately
        // But we'll still use isUpdating to prevent double-clicks within a short timeframe (100ms)
        if (get().isUpdating) return;
        set({ isUpdating: true });
        
        // Use setTimeout to reset the updating flag after a short delay 
        // This provides protection against double-clicks while not blocking the UI
        setTimeout(() => set({ isUpdating: false }), 100);

        const items = get().items;
        const existingItem = items.find(
          item => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
        );

        // Update local state immediately
        if (existingItem) {
          const newQuantity = existingItem.quantity + 1;
          const updatedItems = items.map(item =>
            item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
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
          const newCartItem = { ...newItem, quantity: 1 };
          set({ items: [...items, newCartItem] });
          
          // Add to database in background if user is logged in
          const userId = get().currentUserId;
          if (userId) {
            // Don't await this, let it run in background
            get().syncSetQuantityInDatabase(newItem, 1)
              .catch(err => console.error('Background cart sync failed:', err));
          }
        }
      },
      removeItem: async (id, color, size) => {
        const currentItems = get().items;
        const itemToRemove = currentItems.find(
          item => item.id === id && item.color === color && item.size === size
        );
        
        // Update UI immediately
        set({
          items: currentItems.filter(
            item => !(item.id === id && item.color === color && item.size === size)
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
      clearCart: () => set({ items: [] }),
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
        if (!userId) return;

        try {
          const response = await fetch('/api/user/cart');
          if (response.ok) {
            const data = await response.json();
            // The API returns { items: cartItems[], subtotal, count }
            const dbCartItems = data.items || [];
            
            // Convert database format to store format
            const storeItems: CartItem[] = dbCartItems.map((dbItem: any) => ({
              id: dbItem.productId,
              name: dbItem.products?.name || 'Unknown Product',
              price: dbItem.products?.price || 0,
              color: dbItem.color || '',
              size: dbItem.size || '',
              quantity: dbItem.quantity || 1,
              image: dbItem.products?.images?.[0] || '',
              type: dbItem.type || 'tshirt'
            }));
            
            // Update both state and localStorage
            set({ items: storeItems });
            localStorage.setItem(`cart-${userId}`, JSON.stringify(storeItems));
          }
        } catch (error) {
          console.error('Error syncing cart with database:', error);
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
            
            const storeItems: CartItem[] = dbCartItems.map((dbItem: any) => ({
              id: dbItem.productId,
              name: dbItem.products?.name || 'Unknown Product',
              price: dbItem.products?.price || 0,
              color: dbItem.color || '',
              size: dbItem.size || '',
              quantity: dbItem.quantity || 1,
              image: dbItem.products?.images?.[0] || '',
              type: dbItem.type || 'tshirt'
            }));
            
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
              quantity: quantity // Set exact quantity
            }),
          });
          
          if (!response.ok) {
            const errorData = await response.text();
            console.error(`Failed to sync item to database: ${response.status}`, errorData);
            
            // If we get a server error and haven't retried too many times, try again
            if (response.status >= 500 && retryCount < 2) {
              console.log(`Retrying cart sync (attempt ${retryCount + 1})...`);
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 500 * (retryCount + 1)));
              return get().syncSetQuantityInDatabase(item, quantity);
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