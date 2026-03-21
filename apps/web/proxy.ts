import { withAuth } from "next-auth/middleware";
import { NextResponse, NextRequest } from "next/server";

// 1. Maintain the native customer NextAuth protection
const nextAuthMiddleware = withAuth({
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET || "default_jwt_secret_key",
});

// 2. Export the universal router
export default function middleware(req: NextRequest, event: any) {
    const { pathname } = req.nextUrl;

    // Handle Admin Portal specifically
    if (pathname.startsWith('/admin')) {
        // Public admin routes
        if (pathname === '/admin/login' || pathname === '/admin/onboarding') {
            return NextResponse.next();
        }

        // Vaulted admin routes
        const adminToken = req.cookies.get('admin_session')?.value;
        if (!adminToken) {
            return NextResponse.redirect(new URL('/admin/login', req.url));
        }

        return NextResponse.next();
    }

    // Pass everything else to next-auth
    return (nextAuthMiddleware as any)(req, event);
}

// 3. Keep exactly the combined matchers
export const config = {
    matcher: [
        "/dashboard/:path*",
        "/customizer/:path*",
        "/admin/:path*",
    ],
};
