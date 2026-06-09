import { create } from 'zustand';

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  imageUrl: string | null;
  salePrice: number;
  quantity: number;
  discount: number; // valor fijo o porcentaje
  discountType: 'value' | 'percent';
  tax: number; // porcentaje
}

interface CartState {
  items: CartItem[];
  observations: string;
  addItem: (item: Omit<CartItem, 'quantity' | 'discount' | 'discountType' | 'tax'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateDiscount: (productId: string, discount: number, discountType: 'value' | 'percent') => void;
  updateTax: (productId: string, tax: number) => void;
  setObservations: (text: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalDiscount: () => number;
  getTotalTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartState>((set, get) => ({
  items: [],
  observations: '',

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

  clearCart: () => set({ items: [], observations: '' }),

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

  getTotalTax: () => {
    const afterDiscount = get().getSubtotal() - get().getTotalDiscount();
    return get().items.reduce((sum, i) => {
      const itemTotal = i.salePrice * i.quantity;
      const itemDiscount =
        i.discountType === 'percent'
          ? (itemTotal * i.discount) / 100
          : i.discount * i.quantity;
      return sum + ((itemTotal - itemDiscount) * i.tax) / 100;
    }, 0);
  },

  getTotal: () => {
    return get().getSubtotal() - get().getTotalDiscount() + get().getTotalTax();
  },

  getItemCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },
}));
