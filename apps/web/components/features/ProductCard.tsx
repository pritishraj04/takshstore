"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "../../types";
import { useCollectionStore } from "../../store/useCollectionStore";
import { useCreateDraft } from "../../hooks/useDigitalInvite";
import { ShoppingBag, Loader2 } from "lucide-react";

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { addItem, setIsOpen } = useCollectionStore();
    const router = useRouter();
    const { mutate: createDraft, isPending: isCreatingDraft } = useCreateDraft();

    const isOutOfStock = product.stockCount !== undefined && product.stockCount !== null && product.stockCount <= 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOutOfStock) return;

        if (product.type === 'DIGITAL') {
            createDraft(product.id, {
                onSuccess: (data) => {
                    router.push(`/customizer/${data.id}`);
                }
            });
            return;
        }
        addItem(product);
        setIsOpen(true);
    };

    return (
        <div className="product-card group flex flex-col items-center cursor-pointer w-full h-full">

            {/* Image Wrapper (Link to Detail Page) */}
            <Link href={`/collection/${product.id}`} className="relative w-full aspect-4/5 overflow-hidden bg-[#F2F1EC] block">
                <img
                    src={product.imageUrl || '/assets/images/placeholder-product.jpg'}
                    alt={product.title}
                    className={`absolute inset-0 w-full h-full object-cover transform scale-100 transition-transform duration-700 ease-out group-hover:scale-105 ${isOutOfStock ? 'opacity-60 grayscale-30' : ''}`}
                />
                {isOutOfStock && (
                    <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm text-white text-[9px] uppercase tracking-[0.2em] px-3 py-1.5 font-medium"
                        style={{ fontFamily: 'var(--font-inter)' }}
                    >
                        Out of Stock
                    </div>
                )}
            </Link>


            {/* Details */}
            <div className="mt-8 flex flex-col items-center text-center">
                <h3
                    className="text-xl md:text-2xl text-[#1A1A1A] mb-2 leading-tight"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                >
                    {product.title}
                </h3>
                <p
                    className="text-xs uppercase tracking-widest text-[#5A5A5A] flex items-center justify-center gap-2"
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    <span>{product.type === 'PHYSICAL' ? 'Physical Canvas' : 'Digital Suite'} — </span>
                    {product.discountedPrice && product.discountedPrice > 0 ? (
                        <span>
                            <span className="line-through text-gray-400 mr-2">₹{product.price.toLocaleString()}</span>
                            <span className="text-black font-semibold">₹{product.discountedPrice.toLocaleString()}</span>
                        </span>
                    ) : (
                        <span>₹{product.price.toLocaleString()}</span>
                    )}
                </p>

                <button
                    onClick={handleAddToCart}
                    disabled={isCreatingDraft || isOutOfStock}
                    className={`mt-6 inline-flex items-center text-[10px] uppercase tracking-[0.2em] pb-1 transition-all duration-500 ease-out ${
                        isOutOfStock
                            ? 'text-[#999] border-b border-[#E5E4DF] cursor-not-allowed opacity-70'
                            : 'text-[#1A1A1A] border-b border-[#E5E4DF] opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 hover:border-[#1A1A1A] disabled:opacity-50'
                    }`}
                    style={{ fontFamily: 'var(--font-inter)' }}
                >
                    {isOutOfStock ? (
                        <>OUT OF STOCK</>
                    ) : isCreatingDraft && product.type === 'DIGITAL' ? (
                        <><Loader2 size={14} className="mr-2 animate-spin" strokeWidth={1.5} /> WORKING...</>
                    ) : (
                        <><ShoppingBag size={14} className="mr-2" strokeWidth={1.5} /> {product.type === 'DIGITAL' ? 'PERSONALIZE' : 'ADD TO BAG'}</>
                    )}
                </button>
            </div>

        </div>
    );
}
