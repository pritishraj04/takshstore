import CheckoutFlow from "@/components/features/CheckoutFlow";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Secure Checkout',
    description: 'Finalize your purchase and secure your bespoke artwork. Our checkout is encrypted for your protection.',
    robots: 'noindex, nofollow',
};

export default function CheckoutPage() {
    return (
        <main>
            <CheckoutFlow />
        </main>
    );
}
