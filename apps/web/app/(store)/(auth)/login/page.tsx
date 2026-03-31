import AuthLayout from "../../../../components/features/AuthLayout";
import LoginForm from "../../../../components/features/LoginForm";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login to Taksh Store',
    description: 'Secure entrance to your personal Taksh account. Access your commissions and manage your digital events.',
    robots: 'noindex, nofollow',
};

export default function LoginPage() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}
