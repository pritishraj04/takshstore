import WebInviteCustomizer from "../../../components/features/WebInviteCustomizer";
import { Product } from "../../../types";

// Mock Database Fetch Function
function getProductById(id: string): Product {
    // We assume this route is primarily hit by DIGITAL items, but we fallback safely.
    return {
        id: id || "prod_002",
        title: "The Midnight Suite",
        price: 1200,
        image_url: "https://images.unsplash.com/photo-1509927083803-4bd519298ac4?auto=format&fit=crop&q=80&w=1200",
        type: "DIGITAL"
    };
}

export default async function CustomizePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const resolvedParams = await params;
    const product = getProductById(resolvedParams.id);

    return (
        <main>
            <WebInviteCustomizer product={product} />
        </main>
    );
}
