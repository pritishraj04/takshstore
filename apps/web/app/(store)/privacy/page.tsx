export default function PrivacyPage() {
    return (
        <main className="w-full min-h-screen bg-[#FBFBF9] text-[#1A1A1A] pt-40 pb-32 px-6 md:px-16 selection:bg-[#1A1A1A] selection:text-[#FBFBF9]">

            <h1 className="text-4xl md:text-6xl text-center mb-16" style={{ fontFamily: 'var(--font-playfair)' }}>
                Privacy Policy
            </h1>

            <article className="max-w-3xl mx-auto">

                <h2 className="text-xl mt-12 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>1. Data Collection Architecture</h2>
                <p className="text-sm leading-loose text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    At Taksh Store, operated in tandem with Polardot, we collect explicit information critical to the engineering and delivery of your commissions. This includes names, addresses, and encrypted payment details required for logistical execution, as well as nuanced event details supplied through our Customizer platform.
                </p>

                <h2 className="text-xl mt-12 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>2. Digital Invitation Data Integrity</h2>
                <p className="text-sm leading-loose text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    The personal details regarding your wedding or life event (such as parent names, venues, and schedules) are stored securely and utilized strictly for the generation of your Next.js-powered digital invitation. We do not aggregate this data for external marketing lists.
                </p>

                <h2 className="text-xl mt-12 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>3. Analytics & the Edge</h2>
                <p className="text-sm leading-loose text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    Our digital environments utilize completely anonymized edge-analytics to monitor hosting performance and assure low-latency delivery across geographical regions.
                </p>

                <h2 className="text-xl mt-12 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>4. Third-Party Transactions</h2>
                <p className="text-sm leading-loose text-[#5A5A5A] mb-8" style={{ fontFamily: 'var(--font-inter)' }}>
                    Taksh Store relies on industry-standard, rigorous payment gateways. At no point does our primary server infrastructure store your raw credit card information.
                </p>

            </article>

        </main>
    );
}
