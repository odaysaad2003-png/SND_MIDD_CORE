import {AuthFormCard} from "../components/auth-form-card";
import {AuthRouteGate} from "../components/auth-route-gate";
import {LoginForm} from "../forms/login-form";

export function LoginPage() {
    return (
        <AuthRouteGate>
            <AuthFormCard
                eyebrow="مرحبًا بعودتك"
                title="سجّل دخولك إلى سند"
                description="أدخل بيانات حسابك للعودة إلى منشوراتك وتفاعلاتك ومساحتك."
                alternativeAction={{
                    prompt: "ليس لديك حساب؟",
                    label: "أنشئ حسابًا",
                    href: "/register",
                }}
            >
                <LoginForm />
            </AuthFormCard>
        </AuthRouteGate>
    );
}
