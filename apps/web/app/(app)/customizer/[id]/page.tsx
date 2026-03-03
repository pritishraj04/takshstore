import CustomizerEditor from "../../../../components/features/CustomizerEditor";

export default async function CustomizerPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    return (
        <main>
            <CustomizerEditor inviteId={resolvedParams.id} />
        </main>
    );
}
