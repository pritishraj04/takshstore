"use client";

import Hero from "../../components/features/Hero";
import CollectionHighlights from "../../components/features/CollectionHighlights";
import StoryBlock from "../../components/features/StoryBlock";
import InsightsBlock from "../../components/features/InsightsBlock";
import TestimonialsBlock from "../../components/features/TestimonialsBlock";
import { useProducts } from "../../hooks/useProducts";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featuredProducts = products?.slice(0, 6) || [];

  return (
    <main className="w-full min-h-screen">
      <Hero />
      <CollectionHighlights products={featuredProducts} isLoading={isLoading} />
      <StoryBlock />
      <InsightsBlock />
      <TestimonialsBlock />
    </main>
  );
}
