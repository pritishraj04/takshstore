"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { API_URL } from '@/config/env';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill in all fields.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Login failed');
            }

            const data = await res.json();
            
            // Securely set the session cookie that Middleware will verify
            Cookies.set('admin_session', data.token, { secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
            
            toast.success("Welcome back!");
            router.push('/admin');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="p-8 bg-white shadow-xl rounded-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
                    <p className="text-gray-500 mt-2">Sign in to manage your ecosystem.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                            required
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
