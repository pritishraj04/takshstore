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
        const adminToken = req.cookies.get('admin_session')?.value;
        const isAuthPage = pathname === '/admin/login' || pathname.startsWith('/admin/onboarding') || pathname.startsWith('/admin/forgot-password');

        // If they HAVE a token and try to go to Login/Onboarding -> Bounce to Dashboard
        if (adminToken && isAuthPage) {
            return NextResponse.redirect(new URL('/admin', req.url));
        }

        // If they DO NOT have a token and try to go anywhere else in /admin -> Bounce to Login
        if (!adminToken && !isAuthPage) {
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
