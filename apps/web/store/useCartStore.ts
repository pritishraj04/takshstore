import { create } from 'zustand';

interface CartState {
    items: any[];
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
    items: [],
    clearCart: () => set({ items: [] }),
}));
