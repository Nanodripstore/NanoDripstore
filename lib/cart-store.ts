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
  syncSetQuantityInDatabase: (item: Omit<CartItem, 'quantity'>, quantity: number) => Promise<void>;
  syncRemoveFromDatabase: (productId: number, color: string, size: string) => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      currentUserId: null,
      isUpdating: false,
      addItem: async (newItem) => {
        // Prevent rapid clicking
        if (get().isUpdating) return;
        set({ isUpdating: true });

        try {
          const items = get().items;
          const existingItem = items.find(
            item => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
          );

          if (existingItem) {
            const newQuantity = existingItem.quantity + 1;
            const updatedItems = items.map(item =>
              item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
                ? { ...item, quantity: newQuantity }
                : item
            );
            set({ items: updatedItems });
            
            // Update database if user is logged in - set exact quantity, don't add
            const userId = get().currentUserId;
            if (userId) {
              await get().syncSetQuantityInDatabase(newItem, newQuantity);
            }
          } else {
            const newCartItem = { ...newItem, quantity: 1 };
            set({ items: [...items, newCartItem] });
            
            // Add to database if user is logged in
            const userId = get().currentUserId;
            if (userId) {
              await get().syncSetQuantityInDatabase(newItem, 1);
            }
          }
        } finally {
          set({ isUpdating: false });
        }
      },
      removeItem: async (id, color, size) => {
        const currentItems = get().items;
        const itemToRemove = currentItems.find(
          item => item.id === id && item.color === color && item.size === size
        );
        
        set({
          items: currentItems.filter(
            item => !(item.id === id && item.color === color && item.size === size)
          )
        });

        // Remove from database if user is logged in
        const userId = get().currentUserId;
        if (userId && itemToRemove) {
          await get().syncRemoveFromDatabase(id, color, size);
        }
      },
      updateQuantity: async (id, color, size, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(id, color, size);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === id && item.color === color && item.size === size
              ? { ...item, quantity }
              : item
          )
        });

        // Update database if user is logged in - set exact quantity
        const userId = get().currentUserId;
        if (userId) {
          const item = get().items.find(item => item.id === id && item.color === color && item.size === size);
          if (item) {
            await get().syncSetQuantityInDatabase(item, quantity);
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
            const dbCartItems = await response.json();
            // Convert database format to store format
            const storeItems: CartItem[] = dbCartItems.map((dbItem: any) => ({
              id: dbItem.productId,
              name: dbItem.name,
              price: dbItem.price,
              color: dbItem.color,
              size: dbItem.size,
              quantity: dbItem.quantity,
              image: dbItem.image,
              type: dbItem.type
            }));
            
            // Update both state and localStorage
            set({ items: storeItems });
            localStorage.setItem(`cart-${userId}`, JSON.stringify(storeItems));
          }
        } catch (error) {
          console.error('Error syncing cart with database:', error);
        }
      },
      syncSetQuantityInDatabase: async (item: Omit<CartItem, 'quantity'>, quantity: number) => {
        try {
          // Use PUT method to set exact quantity instead of adding
          const response = await fetch('/api/user/cart', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: item.id,
              name: item.name,
              price: item.price,
              color: item.color,
              size: item.size,
              image: item.image,
              type: item.type,
              quantity: quantity // Set exact quantity
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to sync item to database');
          }
        } catch (error) {
          console.error('Error syncing quantity to database:', error);
        }
      },
      syncRemoveFromDatabase: async (productId: number, color: string, size: string) => {
        try {
          // We need to find the database item ID first
          const response = await fetch('/api/user/cart');
          if (response.ok) {
            const dbItems = await response.json();
            const itemToDelete = dbItems.find((item: any) => 
              item.productId === productId && item.color === color && item.size === size
            );
            
            if (itemToDelete) {
              await fetch(`/api/user/cart?id=${itemToDelete.id}`, {
                method: 'DELETE',
              });
            }
          }
        } catch (error) {
          console.error('Error syncing remove from database:', error);
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