export type ProductType = 'PHYSICAL' | 'DIGITAL';

export interface Product {
    id: string;
    title: string;
    price: number;
    image_url: string;
    type: ProductType;
}

export interface CollectionItem extends Product {
    quantity: number;
}
