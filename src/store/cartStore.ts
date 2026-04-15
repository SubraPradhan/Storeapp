import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string) => number;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        const { items } = get();
        const existing = items.find((i) => i.product.id === product.id);

        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, quantity: 1 }] });
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((i) => i.product.id !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getItemQuantity: (productId: string) => {
        const item = get().items.find((i) => i.product.id === productId);
        return item ? item.quantity : 0;
      },

      getTotalItems: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, i) => sum + i.product.price * i.quantity,
          0
        );
      },
    }),
    {
      name: 'mystore-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCartStore;