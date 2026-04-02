import { Metadata, ResolvingMetadata } from "next";
import ProductDetail from "../../../../components/features/ProductDetail";
import { getApiUrl } from "@/lib/api";

type Props = {
    params: Promise<{ id: string }>
}

async function getProduct(id: string) {
    try {
        const res = await fetch(getApiUrl(`/products/${id}`), {
            next: { revalidate: 0 }
        });
        if (res.ok) return await res.json();
    } catch (e) {}
    return null;
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const id = (await params).id;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Artwork Not Found',
        };
    }

    return {
        title: product.title,
        description: product.description?.length > 160 
            ? product.description.substring(0, 157) + '...' 
            : product.description || 'A unique masterpiece from Taksh Store.',
        openGraph: {
            title: `${product.title} | Taksh Store`,
            description: product.description?.substring(0, 160),
            type: 'article',
            url: `https://takshstore.com/collection/${id}`,
            images: product.imageUrl ? [
                {
                    url: product.imageUrl,
                    width: 1200,
                    height: 630,
                    alt: product.title,
                }
            ] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: product.title,
            description: product.description?.substring(0, 160),
            images: product.imageUrl ? [product.imageUrl] : [],
        }
    };
}

export default async function ProductPage({ params }: Props) {
    const id = (await params).id;
    const product = await getProduct(id);

    if (!product) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#FBFBF9]">
                <h1 className="text-xl text-[#1A1A1A]" style={{ fontFamily: 'var(--font-playfair)' }}>Artwork not found.</h1>
            </main>
        );
    }

    return (
        <main>
            <ProductDetail product={product} />
        </main>
    );
}
