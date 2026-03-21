"use client";

import { useState, FormEvent, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { API_URL } from '@/config/env';

function OnboardingForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!token) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="p-8 bg-white shadow-xl rounded-2xl max-w-md w-full text-center">
                    <h2 className="text-2xl font-semibold text-red-600 mb-2">Error</h2>
                    <p className="text-gray-600">Invalid or missing invitation link.</p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`${API_URL}/admin/auth/setup-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to setup password');
            }

            toast.success("Password setup successfully! Please login.");
            router.push('/admin/login');
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
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Setup Admin Password</h1>
                    <p className="text-gray-500 mt-2">Create a strong password to secure your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
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
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Saving..." : "Save Password & Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><p>Loading...</p></div>}>
            <OnboardingForm />
        </Suspense>
    );
}
