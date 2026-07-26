"use client";

import {motion, useReducedMotion} from "motion/react";
import {LoaderCircle, ShieldCheck} from "lucide-react";
import {useEffect, type ReactNode} from "react";
import {useRouter, useSearchParams} from "next/navigation";

import {useAuth} from "../providers/auth-provider";
import {resolveAuthDestination} from "../navigation/resolve-auth-destination";
import {AuthFormAlert} from "./auth-form-alert";

type AuthRouteGateProps = Readonly<{
    children: ReactNode;
}>;

type AuthRouteStatusProps = Readonly<{
    authenticated?: boolean;
    userName?: string | null;
}>;

function AuthRouteStatus({authenticated = false, userName}: AuthRouteStatusProps) {
    const Icon = authenticated ? ShieldCheck : LoaderCircle;

    return (
        <motion.div
            role="status"
            aria-live="polite"
            aria-busy={!authenticated}
            initial={{
                opacity: 0,
                scale: 0.985,
                y: 12,
            }}
            animate={{
                opacity: 1,
                scale: 1,
                y: 0,
            }}
            className="relative overflow-hidden rounded-[1.85rem] border border-border/80 bg-surface/94 p-7 text-center shadow-[0_28px_90px_rgba(11,40,68,0.13)] backdrop-blur-xl sm:p-9"
        >
            <div aria-hidden="true" className="absolute -end-20 -top-24 size-48 rounded-full bg-brand/10 blur-3xl" />

            <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-brand/15 bg-brand/8 text-brand">
                <Icon aria-hidden="true" className={authenticated ? "size-6" : "size-6 animate-spin"} />
            </span>

            <div className="relative mt-5 grid gap-2">
                <h1 className="text-xl font-bold text-foreground">
                    {authenticated ? (userName ? `أهلًا ${userName}` : "تم العثور على جلستك") : "نتحقق من جلستك"}
                </h1>

                <p className="text-sm leading-7 text-muted-foreground">
                    {authenticated
                        ? "جلستك جاهزة، جار نقلك إلى وجهتك."
                        : "قد تكون لديك جلسة سابقة صالحة. لن يستغرق التحقق سوى لحظات."}
                </p>
            </div>

            <div
                aria-hidden="true"
                className="relative mx-auto mt-6 h-1.5 max-w-48 overflow-hidden rounded-full bg-border/60"
            >
                <motion.span
                    className="absolute inset-y-0 w-1/3 rounded-full bg-[linear-gradient(90deg,var(--hero-deep),var(--brand),var(--hero-warm))]"
                    animate={{
                        x: ["-120%", "330%"],
                    }}
                    transition={{
                        duration: 1.3,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            </div>
        </motion.div>
    );
}

export function AuthRouteGate({children}: AuthRouteGateProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reduceMotion = useReducedMotion();

    const {status, user, sessionError, retrySession} = useAuth();

    const destination = resolveAuthDestination(searchParams.get("returnTo"));

    useEffect(() => {
        if (status !== "authenticated") {
            return;
        }

        const timer = window.setTimeout(
            () => {
                router.replace(destination);
                router.refresh();
            },
            reduceMotion ? 0 : 520
        );

        return () => {
            window.clearTimeout(timer);
        };
    }, [destination, reduceMotion, router, status]);

    if (status === "checking" && !sessionError) {
        return <AuthRouteStatus />;
    }

    if (status === "authenticated") {
        return <AuthRouteStatus authenticated userName={user?.name} />;
    }

    if (sessionError) {
        return (
            <div className="grid gap-3">
                <AuthFormAlert
                    tone="warning"
                    title="تعذر استعادة جلسة سابقة"
                    message="يمكنك إعادة التحقق أو استخدام النموذج أدناه لتسجيل الدخول من جديد."
                    requestId={sessionError.requestId}
                    actionLabel="إعادة التحقق"
                    onAction={() => {
                        void retrySession();
                    }}
                />

                {children}
            </div>
        );
    }

    return children;
}
