import AuthLayout from "../../../../components/features/AuthLayout";
import ResetPasswordForm from "../../../../components/features/ResetPasswordForm";

export const metadata = {
    title: "Reset Password | Taksh Store",
    description: "Securely establish your new password."
};

export default function ResetPasswordPage() {
    return (
        <AuthLayout>
            <ResetPasswordForm />
        </AuthLayout>
    );
}
