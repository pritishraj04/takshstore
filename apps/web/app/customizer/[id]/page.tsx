import CustomizerEditor from "../../../components/features/CustomizerEditor";

export default function CustomizerPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <main>
            <CustomizerEditor inviteId={params.id} />
        </main>
    );
}
