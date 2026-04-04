import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';

export interface MyInvite {
    id: string;
    slug: string | null;
    status: 'DRAFT' | 'DEVELOPMENT' | 'PUBLISHED';
    inviteData: any;
    orderItem: {
        orderId: string;
        status: string;
        order: {
            id: string;
            status: string;
        };
        product?: {
            id: string;
            title: string;
            templateSlug: string;
        };
    };
    isEternity?: boolean;
    marriageDate?: string;
    createdAt: string;
    updatedAt: string;
}

export function useMyInvites() {
    return useQuery({
        queryKey: ['my-invites'],
        queryFn: async (): Promise<MyInvite[]> => {
            const { data } = await apiClient.get('/digital-invites/my-invites');
            return data;
        },
    });
}
