export type ProductType = 'PHYSICAL' | 'DIGITAL';

export interface Product {
    id: string;
    title: string;
    price: number;
    discountedPrice?: number;
    eternityAddonPrice?: number;
    imageUrl: string;
    images?: string[];
    type: ProductType;
    isDigital: boolean;
}

export interface CollectionItem extends Product {
    quantity: number;
    inviteData?: any;
    draftId?: string;
    isEternity?: boolean;
    marriageDate?: string;
}
