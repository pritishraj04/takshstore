import { create } from "zustand";
import { InviteData } from "@taksh/types";

export const defaultInviteData: InviteData = {
    couple: {
        bride: {
            name: "Riya",
            parents: { mother: "Mrs. Sharma", father: "Mr. Sharma" }
        },
        groom: {
            name: "Moon",
            parents: { mother: "Mrs. Singh", father: "Mr. Singh" }
        },
        hashtag: "#RiyaToTheMoon",
        image: ""
    },
    wedding: {
        displayDate: "October 14, 2026"
    },
    celebrations: [
        { id: "haldi", name: "Haldi", date: "Oct 13", time: "10:00 AM", venue: "Villa Balbiano Gardens", googleMapsUrl: "", dressCode: "Yellow & White" },
        { id: "mehendi", name: "Mehendi", date: "Oct 13", time: "4:00 PM", venue: "The Grand Terrace", googleMapsUrl: "", dressCode: "Green & Vibrant" },
        { id: "wedding", name: "Wedding", date: "Oct 14", time: "5:00 PM", venue: "Villa Balbiano", googleMapsUrl: "", dressCode: "Traditional/Formal" }
    ],
    messages: {
        inviteText: "Together with our families, we joyfully invite you to celebrate our wedding.",
        whatsappContact: "+12345678900",
        youtubeLink: "",
        optionalNote: ""
    },
    slug: ""
};

interface InviteState {
    activeInviteId: string | null; // <-- NEW: Tracks exactly which draft is loaded
    activeTemplateSlug: string | null;
    inviteData: InviteData | null;
    setAllData: (data: InviteData) => void;
    initInvite: (inviteId: string, templateSlug: string, initialData: InviteData) => void;
    updateData: (path: string, value: any) => void;
    clearInvite: () => void; // <-- NEW: Wipes state between navigations
}

export const useInviteStore = create<InviteState>((set) => ({
    activeInviteId: null,
    activeTemplateSlug: null,
    inviteData: null,
    setAllData: (data) => set({ inviteData: data }),
    initInvite: (id, slug, data) => set({
        activeInviteId: id,
        activeTemplateSlug: slug,
        // Deep copy prevents React Query cache mutation bleed
        inviteData: JSON.parse(JSON.stringify(data))
    }),
    updateData: (path, value) => set((state) => {
        if (!state.inviteData) return state;
        return { inviteData: { ...state.inviteData, [path]: value } };
    }),
    clearInvite: () => set({
        activeInviteId: null,
        activeTemplateSlug: null,
        inviteData: null
    })
}));