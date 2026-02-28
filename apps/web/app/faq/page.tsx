import FAQAccordion from "@/components/features/FAQAccordion";

export default function FAQPage() {
    return (
        <main className="w-full min-h-screen bg-[#F2F1EC] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16 selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">

            <h1 className="text-4xl md:text-6xl text-center mb-24" style={{ fontFamily: 'var(--font-playfair)' }}>
                Frequently Asked Questions
            </h1>

            <FAQAccordion />

        </main>
    );
}
