import AboutContent from "@/components/features/AboutContent";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'About Our Vision',
    description: 'Learn about Taksh Store\'s commitment to luxury art and digital craftsmanship. Our journey to redefine bespoke elegance.',
};

export default function AboutPage() {
    return (
        <main className="w-full flex-auto relative">
            <AboutContent />
        </main>
    );
}
