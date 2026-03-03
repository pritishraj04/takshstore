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
            const { data } = await apiClient.post('/orders', payload);
            return data;
        },
        onSuccess: (data) => {
            // Check if there's a redirectUrl for PhonePe
            if (data?.redirectUrl) {
                // We'll let the component handle the actual redirect or we can do it here.
                // The prompt says "In your checkout component, inside the onSuccess callback of the mutation..."
                // So here we do nothing or clear the cart.
                clearCollection();
            }
        },
        onError: (error) => {
            console.error('CHECKOUT MUTATION FAILED:', error);
            // Error is handled cleanly by the UI component invoking the hook
        }
    });
}
