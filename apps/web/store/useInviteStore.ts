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
    inviteData: InviteData | null;
    setAllData: (data: InviteData) => void;
}

export const useInviteStore = create<InviteState>((set) => ({
    inviteData: defaultInviteData,
    setAllData: (data) => set({ inviteData: data }),
}));
