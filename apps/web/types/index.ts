export type ProductType = 'PHYSICAL' | 'DIGITAL';

export interface Tag {
    id: string;
    name: string;
    slug: string;
    isSystem: boolean;
}

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
    tags?: Tag[];
    salesCount?: number;
    viewCount?: number;
    averageRating?: number;
}

export interface CollectionItem extends Product {
    quantity: number;
    inviteData?: any;
    draftId?: string;
    isEternity?: boolean;
    marriageDate?: string;
}
