import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { toast } from 'sonner';

export function useRetryPayment() {
    return useMutation({
        mutationFn: async (orderId: string) => {
            const { data } = await apiClient.post(`/payments/retry/${orderId}`);
            return data;
        },
        onSuccess: (data) => {
            if (data?.redirectUrl) {
                // Instantly redirect to PhonePe for the regenerated retry session
                window.location.href = data.redirectUrl;
            }
        },
        onError: (error: any) => {
            console.error('RETRY MUTATION FAILED:', error);
            toast.error(error?.response?.data?.message || 'Failed to initialize retry session. Please check with your bank.');
        }
    });
}
