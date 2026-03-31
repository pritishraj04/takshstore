import AuthLayout from "../../../../components/features/AuthLayout";
import RegisterForm from "../../../../components/features/RegisterForm";
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Create an Account',
    description: 'Begin your creative journey with Taksh Store. Register to start a custom canvas artwork or digital invite commission.',
    robots: 'noindex, nofollow',
};

export default function RegisterPage() {
    return (
        <AuthLayout>
            <RegisterForm />
        </AuthLayout>
    );
}
