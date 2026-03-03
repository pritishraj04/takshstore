import OrderDetails from "../../../../../components/features/OrderDetails";

export default async function OrderPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // In Next.js 15+, dynamic route params must be awaited
    const resolvedParams = await params;

    return (
        <main className="w-full">
            <OrderDetails orderId={resolvedParams.id} />
        </main>
    );
}
