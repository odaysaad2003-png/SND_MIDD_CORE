"use client";

import {LoaderCircle, RefreshCw, ShieldX} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect, type ReactNode} from "react";

import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {useAuth} from "@/features/auth/providers/auth-provider";

type AdminRouteGateProps = Readonly<{
    children: ReactNode;
}>;

function buildLoginDestination(returnTo: string): string {
    return `/login?${new URLSearchParams({returnTo}).toString()}`;
}

function AdminGateProgress({redirecting}: Readonly<{redirecting: boolean}>) {
    return (
        <main className="grid min-h-dvh place-items-center bg-background px-4 py-12">
            <section
                role="status"
                aria-live="polite"
                aria-busy="true"
                className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-border bg-surface p-7 text-center shadow-[0_24px_75px_rgba(11,40,68,0.1)] sm:p-10"
            >
                <div aria-hidden="true" className="absolute -end-16 -top-20 size-52 rounded-full bg-brand/10 blur-3xl" />
                <span className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10 text-brand">
                    <LoaderCircle aria-hidden="true" className="size-6 motion-safe:animate-spin" />
                </span>
                <h1 className="relative mt-5 text-2xl font-bold text-foreground">
                    {redirecting ? "جار نقلك إلى تسجيل الدخول" : "نتحقق من صلاحية الإدارة"}
                </h1>
                <p className="relative mx-auto mt-2 max-w-xl leading-7 text-muted-foreground">
                    {redirecting
                        ? "سنحفظ مسار لوحة الإدارة لتعود إليه بعد تسجيل الدخول."
                        : "لن نعرض أي بيانات إدارية قبل حسم الجلسة والدور الحالي."}
                </p>
            </section>
        </main>
    );
}

export function AdminRouteGate({children}: AdminRouteGateProps) {
    const router = useRouter();
    const {status, user, sessionError, retrySession} = useAuth();

    useEffect(() => {
        if (status !== "anonymous") {
            return;
        }

        const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        router.replace(buildLoginDestination(returnTo));
    }, [router, status]);

    if (status === "checking") {
        if (sessionError) {
            return (
                <main className="grid min-h-dvh place-items-center bg-background px-4 py-12">
                    <div className="w-full max-w-2xl">
                        <Feedback
                            variant="warning"
                            title="تعذر التحقق من الجلسة الإدارية"
                            description={
                                <div className="grid gap-4">
                                    <p>
                                        لم نفترض أنك مسجل خروج، ولم نعرض بيانات الإدارة. تحقق من الاتصال ثم أعد
                                        المحاولة.
                                    </p>
                                    <div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                void retrySession();
                                            }}
                                        >
                                            <RefreshCw aria-hidden="true" />
                                            إعادة التحقق
                                        </Button>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </main>
            );
        }

        return <AdminGateProgress redirecting={false} />;
    }

    if (status === "anonymous") {
        return <AdminGateProgress redirecting />;
    }

    if (!user || user.role !== "admin") {
        return (
            <main className="grid min-h-dvh place-items-center bg-background px-4 py-12">
                <section className="w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-6 text-center shadow-[0_24px_75px_rgba(11,40,68,0.1)] sm:p-10">
                    <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-danger/10 text-danger">
                        <ShieldX aria-hidden="true" className="size-8" />
                    </span>
                    <h1 className="mt-5 text-3xl font-bold text-foreground">هذه المساحة للمشرفين فقط</h1>
                    <p className="mx-auto mt-3 max-w-xl leading-8 text-muted-foreground">
                        أنت مسجل الدخول، لكن حسابك لا يحمل دور المشرف. لم نسجّل خروجك ولم نحاول تجديد الجلسة بسبب
                        رفض الصلاحية.
                    </p>
                    <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                        <Button asChild>
                            <Link href="/posts">العودة إلى سند</Link>
                        </Button>
                        <Button asChild variant="secondary">
                            <Link href="/profile">فتح حسابي</Link>
                        </Button>
                    </div>
                </section>
            </main>
        );
    }

    return children;
}
