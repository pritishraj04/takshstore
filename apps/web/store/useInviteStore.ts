import { create } from "zustand";
import { InviteData } from "@taksh/types";

interface InviteState {
    inviteData: InviteData | null;
    setAllData: (data: InviteData) => void;
}

export const useInviteStore = create<InviteState>((set) => ({
    inviteData: null,
    setAllData: (data) => set({ inviteData: data }),
}));
