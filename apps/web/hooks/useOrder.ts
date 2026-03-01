import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export function useOrder(orderId: string) {
    return useQuery({
        queryKey: ['order', orderId],
        queryFn: async () => {
            const { data } = await apiClient.get(`/orders/${orderId}`);
            return data;
        },
        enabled: !!orderId,
    });
}
