export type ProductType = 'PHYSICAL' | 'DIGITAL';

export interface Product {
    id: string;
    title: string;
    type: ProductType;
    price: number;
    imageUrl?: string;
}

export interface Person {
    name: string;
    parents: { mother: string; father: string; };
}

export interface Couple {
    bride: Person;
    groom: Person;
    hashtag: string;
    image?: string;
    partner1?: string;
    partner2?: string;
}

export interface Wedding {
    displayDate: string;
    date?: string;
    venue?: string;
}

export interface EventDetails {
    id: string;
    name: string;
    date: string;
    time: string;
    venue: string;
    googleMapsUrl?: string;
    mapImage?: string;
    highlight?: boolean;
    showLocation?: boolean;
    dressCode: string;
    calendarUrl?: string;
}

export interface Messages {
    inviteText: string;
    whatsappContact?: string;
    youtubeLink?: string;
    optionalNote?: string;
    welcomeMessage?: string;
    thankYou?: string;
    coupleQuote?: string;
}

export interface Contact {
    whatsapp?: string;
    instagram?: string;
}

export interface Music {
    url?: string;
    autoplay?: boolean;
}

export interface InviteData {
    couple: Couple;
    wedding: Wedding;
    celebrations: EventDetails[];
    messages: Messages;
    contact?: Contact;
    music?: Music;
    websiteUrl?: string;
    slug?: string;
    isPaid?: boolean;
}
