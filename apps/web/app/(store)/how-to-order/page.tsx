import OrderProcess from "@/components/features/OrderProcess";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How to Order',
    description: 'A step-by-step guide to ordering your custom wall painting or digital wedding invitation from Taksh Store.',
};

export default function HowToOrderPage() {
    return (
        <main className="w-full flex-auto relative">
            <OrderProcess />
        </main>
    );
}
