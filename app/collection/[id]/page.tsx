import ProductDetail from "../../../components/features/ProductDetail";
import { Product } from "../../../types";

// Mock Database Fetch Function
function getProductById(id: string): Product {
    // We'll mock two specific products to demonstrate both PHYSICAL and DIGITAL types

    if (id === 'prod_002') {
        return {
            id: "prod_002",
            title: "The Midnight Suite",
            price: 1200,
            image_url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&q=80&w=1200",
            type: "DIGITAL"
        };
    }

    // Default fallback (e.g., prod_001 or any other ID)
    return {
        id: id || "prod_001",
        title: "Ethereal Bloom",
        price: 3500,
        image_url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=1200",
        type: "PHYSICAL"
    };
}

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const product = getProductById(resolvedParams.id);

    return (
        <main>
            <ProductDetail product={product} />
        </main>
    );
}
