import ContactInquiry from "@/components/features/ContactInquiry";
import { getApiUrl } from "@/lib/api";

export const dynamic = 'force-dynamic';

async function getContactData() {
    try {
        const res = await fetch(getApiUrl('/cms/content/CONTACT'), {
            next: { revalidate: 3600 },
            signal: AbortSignal.timeout(10000)
        });
        if (res.ok) {
            const data = await res.json();
            if (data.content) return JSON.parse(data.content);
        }
    } catch {}
    
    // Fallback defaults if not saved in CMS yet
    return {
        email: "hello@takshstore.com",
        phone: "+91 999 999 9999",
        address: "Operating from Noida, India.\nServing spaces nationwide.",
        hours: "Mon-Sat, 10am - 6pm"
    };
}

export default async function ContactPage() {
    const contactData = await getContactData();
    return (
        <main className="w-full flex-auto relative">
            <ContactInquiry contactData={contactData} />
        </main>
    );
}
