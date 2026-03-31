import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CollectionItem, Product } from '../types';

interface CollectionState {
    items: CollectionItem[];
    isOpen: boolean;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    incrementItem: (productId: string) => void;
    decrementItem: (productId: string) => void;
    setIsOpen: (isOpen: boolean) => void;
    clearCollection: () => void;
}

export const useCollectionStore = create<CollectionState>()(
    persist(
        (set) => ({
            items: [],
            isOpen: false,

            addItem: (product: Product) => set((state) => {
                const existingItem = state.items.find(item => item.id === product.id);

                if (existingItem) {
                    // Respect stock limits
                    const maxStock = product.stockCount;
                    if (maxStock !== undefined && maxStock !== null && existingItem.quantity >= maxStock) {
                        return state; // Don't exceed stock
                    }
                    return {
                        items: state.items.map(item =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    };
                }

                // Don't add if completely out of stock
                if (product.stockCount !== undefined && product.stockCount !== null && product.stockCount <= 0) {
                    return state;
                }

                return { items: [...state.items, { ...product, quantity: 1 }] };
            }),

            removeItem: (productId: string) => set((state) => ({
                items: state.items.filter(item => item.id !== productId)
            })),

            updateQuantity: (productId: string, quantity: number) => set((state) => {
                if (quantity <= 0) {
                    return { items: state.items.filter(item => item.id !== productId) };
                }
                return {
                    items: state.items.map(item =>
                        item.id === productId
                            ? { ...item, quantity }
                            : item
                    )
                };
            }),

            incrementItem: (productId: string) => set((state) => {
                const item = state.items.find(i => i.id === productId);
                if (!item) return state;
                const maxStock = item.stockCount;
                if (maxStock !== undefined && maxStock !== null && item.quantity >= maxStock) {
                    return state; // Don't exceed stock
                }
                return {
                    items: state.items.map(i =>
                        i.id === productId
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    )
                };
            }),

            decrementItem: (productId: string) => set((state) => {
                const item = state.items.find(i => i.id === productId);
                if (!item) return state;
                if (item.quantity <= 1) {
                    return { items: state.items.filter(i => i.id !== productId) };
                }
                return {
                    items: state.items.map(i =>
                        i.id === productId
                            ? { ...i, quantity: i.quantity - 1 }
                            : i
                    )
                };
            }),

            setIsOpen: (isOpen: boolean) => set({ isOpen }),

            clearCollection: () => set({ items: [] }),
        }),
        {
            name: 'taksh-collection-storage', // unique name for localStorage key
        }
    )
);
