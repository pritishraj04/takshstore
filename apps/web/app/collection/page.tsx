import CollectionGrid from "../../components/features/CollectionGrid";
import { Product } from "../../types";

// Mock Database of Products
const MOCK_PRODUCTS: Product[] = [
    {
        id: "prod_001",
        title: "Ethereal Bloom",
        price: 3500,
        image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3",
        type: "PHYSICAL"
    },
    {
        id: "prod_002",
        title: "The Midnight Suite",
        price: 1200,
        image_url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3",
        type: "DIGITAL"
    },
    {
        id: "prod_003",
        title: "Golden Hour Canvas",
        price: 4200,
        image_url: "https://images.unsplash.com/photo-1544078755-9a8492027b1f?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3",
        type: "PHYSICAL"
    },
    {
        id: "prod_004",
        title: "Minimalist Vows",
        price: 850,
        image_url: "https://images.unsplash.com/photo-1605651475759-42b78a9c2794?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3",
        type: "DIGITAL"
    },
    {
        id: "prod_005",
        title: "Abstract Heirloom",
        price: 5500,
        image_url: "https://images.unsplash.com/photo-1460518451285-97b6aa326961?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3",
        type: "PHYSICAL"
    },
    {
        id: "prod_006",
        title: "The Botanical Invite",
        price: 950,
        image_url: "https://images.unsplash.com/photo-1523698114639-65d1d60742d4?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3",
        type: "DIGITAL"
    }
];

export default function CollectionPage() {
    return (
        <main>
            <CollectionGrid products={MOCK_PRODUCTS} />
        </main>
    );
}
