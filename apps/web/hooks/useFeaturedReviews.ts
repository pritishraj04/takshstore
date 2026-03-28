import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export const useFeaturedReviews = () => {
    return useQuery({
        queryKey: ['featured-reviews'],
        queryFn: async () => {
            const res = await apiClient.get('/reviews/featured');
            return res.data;
        },
        retry: 3,
    });
};
