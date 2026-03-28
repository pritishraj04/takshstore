export type ProductType = 'PHYSICAL' | 'DIGITAL';

export interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    discountedPrice?: number;
    eternityAddonPrice?: number;
    imageUrl: string;
    images?: string[];
    type: ProductType;
    isDigital: boolean;
    weight?: number;
    width?: number;
    height?: number;
    stockCount?: number;
}

export interface CollectionItem extends Product {
    quantity: number;
    inviteData?: any;
    draftId?: string;
    isEternity?: boolean;
    marriageDate?: string;
}
