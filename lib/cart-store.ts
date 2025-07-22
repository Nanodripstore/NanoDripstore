import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number, color: string, size: string) => void;
  updateQuantity: (id: number, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find(
          item => item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
        );

        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === newItem.id && item.color === newItem.color && item.size === newItem.size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...newItem, quantity: 1 }]
          });
        }
      },
      removeItem: (id, color, size) => {
        set({
          items: get().items.filter(
            item => !(item.id === id && item.color === color && item.size === size)
          )
        });
      },
      updateQuantity: (id, color, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id, color, size);
          return;
        }
        set({
          items: get().items.map(item =>
            item.id === id && item.color === color && item.size === size
              ? { ...item, quantity }
              : item
          )
        });
      },
      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);