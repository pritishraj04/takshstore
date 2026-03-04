import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { InviteData } from "@taksh/types";
import { toast } from "sonner";

// The hook returns the full DigitalInvite record, which contains the `inviteData` JSON
export function useDigitalInvite(id: string) {
    return useQuery({
        queryKey: ["digitalInvite", id],
        queryFn: async () => {
            if (id === 'new') return null;
            const { data } = await apiClient.get(`/digital-invites/${id}`);
            return data;
        },
        enabled: id !== 'new' && !!id, // Only run the query if we have an ID and it's not 'new'
    });
}

// The mutation expects just the inviteData payload
export function useUpdateInvite(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (inviteData: InviteData) => {
            const { data } = await apiClient.patch(`/digital-invites/${id}`, {
                inviteData,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["digitalInvite", id] });
            toast.success("Changes published successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to publish changes.");
        }
    });
}

// Hook to create a new draft
export function useCreateDraft() {
    return useMutation({
        mutationFn: async (productId: string) => {
            const { data } = await apiClient.post(`/digital-invites/draft`, {
                productId,
            });
            return data;
        },
        onSuccess: () => {
            toast.success("Draft created! Redirecting to studio...");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create draft.");
        }
    });
}

// Hook to delete a draft
export function useDeleteDraft() {
    return useMutation({
        mutationFn: async (id: string) => {
            const { data } = await apiClient.delete(`/digital-invites/draft/${id}`);
            return data;
        },
        onSuccess: () => {
            toast.success("Draft deleted.");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete draft.");
        }
    });
}
