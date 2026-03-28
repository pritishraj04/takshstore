"use client";

import { ShieldCheck } from 'lucide-react';
import ForgotPasswordForm from '../../../components/features/ForgotPasswordForm';

export default function AdminForgotPasswordPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="p-8 bg-white shadow-xl rounded-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="mx-auto w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Recovery</h1>
                    <p className="text-gray-500 mt-2">Enter your email to reset your admin access.</p>
                </div>

                <ForgotPasswordForm initialType="ADMIN" />
            </div>
        </div>
    );
}
