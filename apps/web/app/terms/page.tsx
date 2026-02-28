export default function TermsPage() {
    return (
        <main className="w-full min-h-screen bg-[#FBFBF9] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16 selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">

            <h1 className="text-4xl md:text-6xl text-center mb-16" style={{ fontFamily: 'var(--font-playfair)' }}>
                Terms & Conditions
            </h1>

            <article className="max-w-3xl mx-auto">

                <h2 className="text-xl mt-12 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>1. Intellectual Property & Artistry</h2>
                <p className="text-sm leading-loose text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    All artwork, designs, code bases, and digital structures presented on the Taksh Store platform remain the exclusive intellectual property of Taksh Studio and our parent entity, Polardot. When you purchase a physical canvas, you acquire the physical piece but not reproduction rights. When purchasing a digital layout, you acquire a limited license strictly for personal event use.
                </p>

                <h2 className="text-xl mt-12 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>2. Digital Blueprint Revisions</h2>
                <p className="text-sm leading-loose text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    Upon utilizing our online Customizer to secure a digital product, you acknowledge that the input acts as the foundational blueprint. Following the delivery of your initial staging link, you are entitled to two (2) comprehensive rounds of revisions. Any architectural changes beyond this designated scope may incur supplemental bespoke layout fees.
                </p>

                <h2 className="text-xl mt-12 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>3. Physical Commissions & Shipping</h2>
                <p className="text-sm leading-loose text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    Physical artwork is shipped explicitly via tracked, insured art couriers. Due to the bespoke, abstract nature of our heavy-body acrylic applications, slight variances from any preliminary sketches or digital mockups are to be expected and celebrated as part of the human, non-templated creative process.
                </p>

                <h2 className="text-xl mt-12 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>4. Order Cancellation</h2>
                <p className="text-sm leading-loose text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    Given the highly personalized nature of our physical canvases and automated staging environments, orders cannot be completely canceled once our studio production or engineering deployment has commenced.
                </p>

            </article>

        </main>
    );
}
