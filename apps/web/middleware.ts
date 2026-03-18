import { withAuth } from "next-auth/middleware";

export default withAuth({
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "default_jwt_secret_key",
});

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/customizer/:path*",
    ],
};
