import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const res = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/login`,
                        {
                            email: credentials.email,
                            password: credentials.password,
                        }
                    );

                    if (res.data && res.data.access_token) {
                        return {
                            id: res.data.user?.id || 'id',
                            email: res.data.user?.email || credentials.email,
                            name: res.data.user?.name,
                            access_token: res.data.access_token,
                        } as any;
                    }
                    return null;
                } catch (e) {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.access_token = (user as any).access_token;
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                (session as any).access_token = token.access_token;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET || "default_jwt_secret_key",
};
