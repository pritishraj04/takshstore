import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CollectionItem, Product } from '../types';

interface CollectionState {
    items: CollectionItem[];
    isOpen: boolean;
    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
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
                    return {
                        items: state.items.map(item =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    };
                }

                return { items: [...state.items, { ...product, quantity: 1 }] };
            }),

            removeItem: (productId: string) => set((state) => ({
                items: state.items.filter(item => item.id !== productId)
            })),

            setIsOpen: (isOpen: boolean) => set({ isOpen }),

            clearCollection: () => set({ items: [] }),
        }),
        {
            name: 'taksh-collection-storage', // unique name for localStorage key
        }
    )
);
