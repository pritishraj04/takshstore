import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { useCollectionStore } from '../store/useCollectionStore';
import { useRouter } from 'next/navigation';
import { ProductType, InviteData } from '@taksh/types';

export interface OrderItemPayload {
    productId: string;
    quantity: number;
    priceAtPurchase: number;
    type: ProductType;
    inviteData?: InviteData;
    draftId?: string;
}

export interface CreateOrderPayload {
    totalAmount: number;
    shippingAddress?: any;
    developerNotes?: string;
    items: OrderItemPayload[];
}

export function useCheckout() {
    const router = useRouter();
    const clearCollection = useCollectionStore((state) => state.clearCollection);

    return useMutation({
        mutationFn: async (payload: CreateOrderPayload) => {
            const { data } = await apiClient.post('/checkout/initiate', payload);
            return data;
        },
        onSuccess: (data) => {
            // Handled by the component
        },
        onError: (error) => {
            console.error('CHECKOUT MUTATION FAILED:', error);
            // Error is handled cleanly by the UI component invoking the hook
        }
    });
}
