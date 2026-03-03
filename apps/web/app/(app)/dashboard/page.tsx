import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { redirect } from "next/navigation";
import UserDashboard from "../../../components/features/UserDashboard";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        redirect("/login");
    }

    // NextAuth types default user.name, but let's grab it or fallback
    const name = session.user.name || "Client";

    return <UserDashboard name={name} />;
}
