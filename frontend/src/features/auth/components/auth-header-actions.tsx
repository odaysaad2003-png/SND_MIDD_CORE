"use client";

import {LoaderCircle, LogIn, LogOut, UserRoundPlus} from "lucide-react";
import Link from "next/link";
import {useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Button, buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

import {useAuth} from "../providers/auth-provider";

export function AuthHeaderActions() {
    const {status, user, sessionError, logout} = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function handleLogout(): Promise<void> {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await logout();

            sndToast.success({
                title: "تم تسجيل الخروج",
                description: "أزلنا بيانات جلستك الخاصة من الواجهة وأنهينا جلسة التجديد.",
            });
        } catch {
            /*
             * AuthProvider ينفذ التنظيف المحلي قبل طلب الشبكة دائمًا.
             * لذلك لا نعيد الحالة إلى authenticated عند فشل Render أو انقطاع الاتصال.
             */
            sndToast.warning({
                title: "تم الخروج محليًا",
                description:
                    "أزلنا بيانات الجلسة من الواجهة، لكن تعذر تأكيد إنهائها على الخادم. تجنب إعادة تحميل الصفحة على جهاز مشترك حتى يعود الاتصال.",
                durationMs: 0,
            });
        } finally {
            setIsLoggingOut(false);
        }
    }

    if (isLoggingOut) {
        return (
            <Button type="button" variant="ghost" size="sm" disabled aria-busy="true">
                <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                <span className="hidden sm:inline">جار تسجيل الخروج</span>
                <span className="sr-only sm:hidden">جار تسجيل الخروج</span>
            </Button>
        );
    }

    if (status === "checking" && !sessionError) {
        return (
            <span
                role="status"
                aria-label="جار التحقق من الجلسة"
                className="grid size-9 place-items-center rounded-xl text-muted-foreground"
            >
                <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
            </span>
        );
    }

    if (status === "authenticated" && user) {
        return (
            <div role="group" aria-label="إجراءات الحساب" className="flex items-center gap-1">
                <span
                    className="hidden max-w-36 truncate px-2 text-sm font-semibold text-foreground xl:inline"
                    title={user.name}
                >
                    {user.name}
                </span>

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label="تسجيل الخروج"
                    onClick={() => {
                        void handleLogout();
                    }}
                >
                    <LogOut aria-hidden="true" />
                    <span className="hidden sm:inline">خروج</span>
                </Button>
            </div>
        );
    }

    return (
        <div role="group" aria-label="الدخول إلى الحساب" className="flex items-center gap-1">
            <Link
                href="/login"
                aria-label="تسجيل الدخول"
                className={cn(buttonVariants({variant: "ghost", size: "sm"}), "px-2.5")}
            >
                <LogIn aria-hidden="true" />
                <span className="hidden sm:inline">دخول</span>
            </Link>

            <Link
                href="/register"
                className={cn(buttonVariants({size: "sm"}), "hidden lg:inline-flex")}
            >
                <UserRoundPlus aria-hidden="true" />
                إنشاء حساب
            </Link>
        </div>
    );
}
