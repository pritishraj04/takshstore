import InquiryInbox from "@/components/admin/InquiryInbox";

export const metadata = {
    title: "Customer Inquiries | Taksh Store Admin",
};

export default function InquiriesPage() {
    return (
        <main className="min-h-screen">
            <InquiryInbox />
        </main>
    );
}
