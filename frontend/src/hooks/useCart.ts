import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  imageUrl: string | null;
  salePrice: number;
  quantity: number;
  discount: number;
  discountType: 'value' | 'percent';
  tax: number;
}

export interface SuspendedSale {
  id: string;
  createdAt: string;
  items: CartItem[];
  observations: string;
  globalDiscount: number;
  globalDiscountType: 'value' | 'percent';
  clientName: string;
}

interface CartState {
  items: CartItem[];
  observations: string;
  globalDiscount: number;
  globalDiscountType: 'value' | 'percent';
  suspendedSales: SuspendedSale[];

  addItem: (item: Omit<CartItem, 'quantity' | 'discount' | 'discountType' | 'tax'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number, discountType: 'value' | 'percent') => void;
  updateTax: (productId: string, tax: number) => void;
  setObservations: (text: string) => void;
  setGlobalDiscount: (discount: number, type: 'value' | 'percent') => void;
  clearCart: () => void;

  suspendSale: () => void;
  resumeSale: (id: string) => void;
  deleteSuspendedSale: (id: string) => void;

  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getGlobalDiscount: () => number;
  getTotalTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      observations: '',
      globalDiscount: 0,
      globalDiscountType: 'value',
      suspendedSales: [],

      addItem: (product) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                ...product,
                quantity: 1,
                discount: 0,
                discountType: 'value',
                tax: 0,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        }));
      },

      updateDiscount: (productId, discount, discountType) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, discount, discountType } : i
          ),
        }));
      },

      updateTax: (productId, tax) => {
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, tax } : i)),
        }));
      },

      setObservations: (text) => set({ observations: text }),

      setGlobalDiscount: (discount, type) => set({ globalDiscount: discount, globalDiscountType: type }),

      clearCart: () => set({ items: [], observations: '', globalDiscount: 0, globalDiscountType: 'value' }),

      suspendSale: () => {
        const state = get();
        if (state.items.length === 0) return;
        const sale: SuspendedSale = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          items: state.items,
          observations: state.observations,
          globalDiscount: state.globalDiscount,
          globalDiscountType: state.globalDiscountType,
          clientName: '',
        };
        set((s) => ({
          suspendedSales: [sale, ...s.suspendedSales],
          items: [],
          observations: '',
          globalDiscount: 0,
          globalDiscountType: 'value',
        }));
      },

      resumeSale: (id) => {
        const state = get();
        const sale = state.suspendedSales.find((s) => s.id === id);
        if (!sale) return;
        set((s) => ({
          items: sale.items,
          observations: sale.observations,
          globalDiscount: sale.globalDiscount,
          globalDiscountType: sale.globalDiscountType,
          suspendedSales: s.suspendedSales.filter((x) => x.id !== id),
        }));
      },

      deleteSuspendedSale: (id) => {
        set((state) => ({
          suspendedSales: state.suspendedSales.filter((s) => s.id !== id),
        }));
      },

      getSubtotal: () => {
        return get().items.reduce((sum, i) => sum + i.salePrice * i.quantity, 0);
      },

      getTotalDiscount: () => {
        return get().items.reduce((sum, i) => {
          if (i.discountType === 'percent') {
            return sum + (i.salePrice * i.quantity * i.discount) / 100;
          }
          return sum + i.discount * i.quantity;
        }, 0);
      },

      getGlobalDiscount: () => {
        const subtotal = get().getSubtotal() - get().getTotalDiscount();
        const { globalDiscount, globalDiscountType } = get();
        if (globalDiscountType === 'percent') {
          return (subtotal * globalDiscount) / 100;
        }
        return Math.min(globalDiscount, subtotal);
      },

      getTotalTax: () => {
        const afterAllDiscounts = get().getSubtotal() - get().getTotalDiscount() - get().getGlobalDiscount();
        return get().items.reduce((sum, i) => {
          const itemTotal = i.salePrice * i.quantity;
          const itemDiscount =
            i.discountType === 'percent'
              ? (itemTotal * i.discount) / 100
              : i.discount * i.quantity;
          const proportion = afterAllDiscounts > 0 ? (itemTotal - itemDiscount) / afterAllDiscounts : 0;
          const itemGlobalDiscount = proportion * get().getGlobalDiscount();
          return sum + ((itemTotal - itemDiscount - itemGlobalDiscount) * i.tax) / 100;
        }, 0);
      },

      getTotal: () => {
        return get().getSubtotal() - get().getTotalDiscount() - get().getGlobalDiscount() + get().getTotalTax();
      },

      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: 'koda-cart-storage',
      partialize: (state) => ({ suspendedSales: state.suspendedSales }),
    }
  )
);
