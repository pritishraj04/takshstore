export type ProductType = 'PHYSICAL' | 'DIGITAL';

export interface Product {
    id: string;
    name: string;
    type: ProductType;
    price: number;
}

export interface Couple {
    partner1: string;
    partner2: string;
}

export interface Wedding {
    date: string;
    venue: string;
}

export interface Celebrations {
    events: string[];
}

export interface Messages {
    welcomeMessage: string;
}

export interface InviteData {
    couple: Couple;
    wedding: Wedding;
    celebrations: Celebrations;
    messages: Messages;
}
