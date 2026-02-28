export default function CustomizeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#FBFBF9] min-h-screen">
            {children}
        </div>
    );
}
