import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { Product } from '../types';

export function useProducts(tags?: string[]) {
    return useQuery({
        queryKey: ['products', tags],
        queryFn: async () => {
            const url = tags && tags.length > 0 
                ? `/products?tags=${tags.join(',')}`
                : '/products';
            const { data } = await apiClient.get<Product[]>(url);
            return data;
        },
        placeholderData: (previousData) => previousData,
    });
}
