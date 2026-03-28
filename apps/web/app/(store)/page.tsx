"use client";

import Hero from "../../components/features/Hero";
import CollectionHighlights from "../../components/features/CollectionHighlights";
import HowItWorks from "../../components/features/HowItWorks";
import WhyGoDigital from "../../components/features/WhyGoDigital";
import StoryBlock from "../../components/features/StoryBlock";
import InsightsBlock from "../../components/features/InsightsBlock";
import TestimonialsBlock from "../../components/features/TestimonialsBlock";
import SpringWeddingPromo from "../../components/features/SpringWeddingPromo";
import DynamicFeaturedCoupon from "../../components/features/DynamicFeaturedCoupon";
import { useProducts } from "../../hooks/useProducts";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const featuredProducts = products?.slice(0, 6) || [];

  return (
    <main className="w-full min-h-screen">
      <Hero />
      <CollectionHighlights products={featuredProducts} isLoading={isLoading} />
      <HowItWorks />
      <SpringWeddingPromo />
      <WhyGoDigital />
      <DynamicFeaturedCoupon />
      <StoryBlock />
      <InsightsBlock />
      <TestimonialsBlock />
    </main>
  );
}
