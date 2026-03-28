import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export const useOrderReviews = (orderId: string) => {
    return useQuery({
        queryKey: ['order-reviews', orderId],
        queryFn: async () => {
            const res = await apiClient.get(`/reviews/order/${orderId}`);
            return res.data;
        },
        enabled: !!orderId,
        retry: false,
    });
};
