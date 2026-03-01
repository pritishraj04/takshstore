import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient";
import { InviteData } from "@taksh/types";

// The hook returns the full DigitalInvite record, which contains the `inviteData` JSON
export function useDigitalInvite(id: string) {
    return useQuery({
        queryKey: ["digitalInvite", id],
        queryFn: async () => {
            const { data } = await apiClient.get(`/digital-invites/${id}`);
            return data;
        },
        enabled: !!id, // Only run the query if we have an ID
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
        },
    });
}
