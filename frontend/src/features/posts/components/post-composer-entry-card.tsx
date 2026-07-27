"use client";

import {LoaderCircle, PenLine, RefreshCw, ShieldCheck, WifiOff} from "lucide-react";
import Link from "next/link";
import {useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Avatar} from "@/components/ui/avatar";
import {Button, buttonVariants} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {useAuth} from "@/features/auth/providers/auth-provider";
import {cn} from "@/lib/utils/cn";

import {useOnlineStatus} from "../hooks/use-online-status";
import {PostComposerTrigger} from "./post-composer-trigger";

type PostComposerEntryCardProps = Readonly<{
    returnTo?: string;
}>;

function buildAuthHref(pathname: "/login" | "/register", returnTo: string): string {
    const query = new URLSearchParams({returnTo});
    return `${pathname}?${query.toString()}`;
}

export function PostComposerEntryCard({returnTo = "/posts?compose=1"}: PostComposerEntryCardProps) {
    const {status, user, sessionError, retrySession} = useAuth();
    const isOnline = useOnlineStatus();
    const [isRetrying, setIsRetrying] = useState(false);

    async function retry(): Promise<void> {
        if (isRetrying) {
            return;
        }

        setIsRetrying(true);

        try {
            await retrySession();
        } catch {
            sndToast.warning({
                title: "تعذر التحقق من الجلسة",
                description: "تحقق من اتصالك ثم أعد المحاولة. لم نغيّر حالة حسابك محليًا.",
                durationMs: 0,
            });
        } finally {
            setIsRetrying(false);
        }
    }

    if (status === "checking") {
        return (
            <Card className="overflow-hidden rounded-[1.75rem] border-brand/15 bg-[linear-gradient(135deg,var(--surface),color-mix(in_oklch,var(--brand)_5%,var(--surface)))] p-4 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                        {sessionError ? <RefreshCw aria-hidden="true" /> : <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />}
                    </span>

                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-foreground">
                            {sessionError ? "تعذر حسم حالة الجلسة" : "نجهّز مساحة المشاركة"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {sessionError
                                ? "لن نفترض أنك مسجّل خروجك بسبب مشكلة اتصال. أعد التحقق للمتابعة بأمان."
                                : "نتحقق من الجلسة قبل إظهار أداة النشر أو خيارات الدخول."}
                        </p>
                    </div>

                    {sessionError ? (
                        <Button
                            type="button"
                            variant="secondary"
                            disabled={isRetrying}
                            aria-busy={isRetrying}
                            onClick={() => void retry()}
                            className="w-full sm:w-auto"
                        >
                            {isRetrying ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : <RefreshCw aria-hidden="true" />}
                            {isRetrying ? "جار التحقق" : "إعادة التحقق"}
                        </Button>
                    ) : null}
                </div>
            </Card>
        );
    }

    if (status === "authenticated" && user) {
        return (
            <Card className="group overflow-hidden rounded-[1.75rem] border-brand/20 bg-[linear-gradient(135deg,var(--surface),color-mix(in_oklch,var(--brand)_6%,var(--surface)))] p-4 shadow-[0_16px_46px_rgba(11,40,68,0.08)] sm:p-5">
                <div className="flex items-start gap-3 sm:items-center">
                    <Avatar
                        imageUrl={user.avatar}
                        name={user.name}
                        sizes="48px"
                        className="size-12 shrink-0 border-2 border-background ring-2 ring-brand/15"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-foreground">مرحبًا {user.name}</p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            شارك ما تحتاجه أو ما يمكن أن يفيد المجتمع. الصور اختيارية ويمكن إدارتها لاحقًا.
                        </p>
                    </div>

                    <span className="hidden rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-bold text-success lg:inline-flex lg:items-center lg:gap-1.5">
                        <ShieldCheck aria-hidden="true" className="size-3.5" />
                        نشر باسمك
                    </span>
                </div>

                <PostComposerTrigger
                    variant="secondary"
                    disabled={!isOnline}
                    aria-disabled={!isOnline}
                    className="mt-4 w-full justify-start rounded-2xl border-brand/15 bg-surface-raised px-4 text-muted-foreground shadow-inner hover:text-foreground"
                >
                    {isOnline ? <PenLine aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
                    {isOnline ? "ما الذي ترغب في مشاركته؟" : "أنت غير متصل الآن — سنعيد إتاحة النشر عند عودة الاتصال"}
                </PostComposerTrigger>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden rounded-[1.75rem] border-brand/15 bg-[linear-gradient(135deg,var(--surface),color-mix(in_oklch,var(--brand)_5%,var(--surface)))] p-5 sm:p-6">
            <div className="grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="grid gap-2">
                    <p className="section-kicker">شارك في مجتمع سند</p>
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">لديك قصة أو طلب أو معلومة مفيدة؟</h2>
                    <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                        القراءة متاحة للجميع. سنطلب تسجيل الدخول فقط عندما تختار النشر، ثم نعيدك إلى المجتمع ونفتح أداة الإنشاء مباشرة.
                    </p>
                </div>

                <div className="flex flex-col gap-2 sm:min-w-44">
                    <Link
                        href={buildAuthHref("/login", returnTo)}
                        className={cn(buttonVariants(), "w-full")}
                    >
                        تسجيل الدخول والنشر
                    </Link>
                    <Link
                        href={buildAuthHref("/register", returnTo)}
                        className={cn(buttonVariants({variant: "secondary"}), "w-full")}
                    >
                        إنشاء حساب
                    </Link>
                </div>
            </div>
        </Card>
    );
}
