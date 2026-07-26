"use client";

import {LoaderCircle} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, type ReactNode} from "react";

import {buttonVariants} from "@/components/ui/button";
import type {ApiError} from "@/lib/api/api-error";
import {cn} from "@/lib/utils/cn";

import {useAuth} from "../providers/auth-provider";
import {AuthFormAlert} from "./auth-form-alert";

type ProtectedRouteGateProps = Readonly<{
    children: ReactNode;
}>;

type ProtectedRouteProgressProps = Readonly<{
    mode: "checking" | "redirecting";
}>;

function buildLoginDestination(returnTo: string): string {
    const searchParams = new URLSearchParams({
        returnTo,
    });

    return `/login?${searchParams.toString()}`;
}

function getSessionRecoveryMessage(error: ApiError): string {
    if (error.kind === "network") {
        return "تعذر الاتصال بالخادم للتحقق من جلستك. لم نسجّل خروجك ولم نعرض بيانات حسابك. تحقق من الاتصال ثم أعد المحاولة.";
    }

    if (error.kind === "invalid-response") {
        return "وصل رد لم نستطع التحقق منه بصورة آمنة. لم نعرض محتوى حسابك، ويمكنك إعادة المحاولة.";
    }

    return "تعذر حسم حالة الجلسة حاليًا. لم نفترض أنك مسجل خروج، ويمكنك إعادة التحقق.";
}

function ProtectedRouteProgress({mode}: ProtectedRouteProgressProps) {
    const isRedirecting = mode === "redirecting";

    return (
        <section className="mx-auto flex min-h-[55dvh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
            <div
                role="status"
                aria-live="polite"
                aria-busy="true"
                className="relative w-full overflow-hidden rounded-[1.75rem] border border-border bg-surface p-7 text-center shadow-[0_24px_75px_rgba(11,40,68,0.1)] sm:p-10"
            >
                <div
                    aria-hidden="true"
                    className="absolute -end-20 -top-24 size-48 rounded-full bg-brand/10 blur-3xl"
                />

                <span className="relative mx-auto grid size-14 place-items-center rounded-2xl border border-brand/15 bg-brand/8 text-brand">
                    <LoaderCircle aria-hidden="true" className="size-6 motion-safe:animate-spin" />
                </span>

                <div className="relative mt-5 grid gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                        {isRedirecting ? "جار نقلك إلى تسجيل الدخول" : "نتحقق من جلستك"}
                    </h1>

                    <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
                        {isRedirecting
                            ? "هذه المساحة خاصة بحسابك. سنحفظ وجهتك الداخلية لتعود إليها بعد تسجيل الدخول."
                            : "لن نعرض محتوى الحساب أو واجهة تسجيل الدخول قبل أن نحسم حالة الجلسة بأمان."}
                    </p>
                </div>
            </div>
        </section>
    );
}

function ProtectedRouteRecovery({
    error,
    onRetry,
}: Readonly<{
    error: ApiError;
    onRetry: () => void;
}>) {
    return (
        <section className="mx-auto flex min-h-[55dvh] w-full max-w-3xl items-center justify-center px-4 py-12 sm:px-6">
            <div className="w-full rounded-[1.75rem] border border-border bg-surface p-5 shadow-[0_24px_75px_rgba(11,40,68,0.1)] sm:p-7">
                <AuthFormAlert
                    tone="warning"
                    title="تعذر التحقق من الجلسة"
                    message={getSessionRecoveryMessage(error)}
                    requestId={error.requestId}
                    actionLabel="إعادة التحقق"
                    onAction={onRetry}
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-lg text-xs leading-6 text-muted-foreground">
                        تستطيع العودة إلى المحتوى العام دون تغيير حالة حسابك المحلية.
                    </p>

                    <Link
                        href="/posts"
                        className={cn(
                            buttonVariants({
                                variant: "secondary",
                                size: "sm",
                            })
                        )}
                    >
                        العودة إلى المنشورات
                    </Link>
                </div>
            </div>
        </section>
    );
}

export function ProtectedRouteGate({children}: ProtectedRouteGateProps) {
    const router = useRouter();

    const {status, sessionError, retrySession} = useAuth();

    useEffect(() => {
        if (status !== "anonymous") {
            return;
        }

        /*
         * نقرأ العنوان الحالي من Browser فقط بعد Hydration.
         *
         * pathname + search + hash
         * تصبح returnTo داخلية، ثم يعيد AuthRouteGate
         * فحصها من خلال allowlist قبل استخدامها.
         */
        const currentDestination =
            `${window.location.pathname}` + `${window.location.search}` + `${window.location.hash}`;

        router.replace(buildLoginDestination(currentDestination));
    }, [router, status]);

    if (status === "authenticated") {
        return children;
    }

    if (status === "checking" && sessionError) {
        return (
            <ProtectedRouteRecovery
                error={sessionError}
                onRetry={() => {
                    void retrySession();
                }}
            />
        );
    }

    return <ProtectedRouteProgress mode={status === "anonymous" ? "redirecting" : "checking"} />;
}
