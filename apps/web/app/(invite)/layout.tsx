export default function InviteLayout({ children }: { children: React.ReactNode }) {
    // Absolutely zero headers or footers. The digital invite owns the entire screen.
    return <main className="min-h-screen w-full bg-[#FBFBF9] text-[#1A1A1A]">{children}</main>;
}
