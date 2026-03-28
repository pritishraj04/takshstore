import AuthLayout from "../../../../components/features/AuthLayout";
import ForgotPasswordForm from "../../../../components/features/ForgotPasswordForm";

export const metadata = {
    title: "Recover Password | Taksh Store",
    description: "Recover secure access to your Taksh account."
};

export default function ForgotPasswordPage() {
    return (
        <AuthLayout>
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
