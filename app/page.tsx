import Hero from "../components/features/Hero";
import CollectionHighlights from "../components/features/CollectionHighlights";
import StoryBlock from "../components/features/StoryBlock";
import InsightsBlock from "../components/features/InsightsBlock";
import TestimonialsBlock from "../components/features/TestimonialsBlock";

export default function Home() {
  return (
    <main className="w-full min-h-screen">
      <Hero />
      <CollectionHighlights />
      <StoryBlock />
      <InsightsBlock />
      <TestimonialsBlock />
    </main>
  );
}
