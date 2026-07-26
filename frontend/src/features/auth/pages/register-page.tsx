import {AuthFormCard} from "../components/auth-form-card";
import {AuthRouteGate} from "../components/auth-route-gate";
import {RegisterForm} from "../forms/register-form";

export function RegisterPage() {
    return (
        <AuthRouteGate>
            <AuthFormCard
                eyebrow="ابدأ من هنا"
                title="أنشئ حسابك في سند"
                description="ثلاثة حقول فقط تفصلك عن الانضمام إلى المجتمع والمشاركة والتفاعل."
                alternativeAction={{
                    prompt: "لديك حساب بالفعل؟",
                    label: "سجّل دخولك",
                    href: "/login",
                }}
            >
                <RegisterForm />
            </AuthFormCard>
        </AuthRouteGate>
    );
}
