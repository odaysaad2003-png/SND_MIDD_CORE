"use client";

import {Camera, ChevronDown, LoaderCircle, LogIn, LogOut, RotateCcw, Settings2, UserRoundPlus} from "lucide-react";
import Link from "next/link";
import {useEffect, useId, useRef, useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Avatar} from "@/components/ui/avatar";
import {Button, buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

import {useAuth} from "../providers/auth-provider";
import type {AuthUser} from "../schemas/auth.schema";

type AuthenticatedAccountMenuProps = Readonly<{
    user: AuthUser;
    logout: () => Promise<void>;
}>;

function AuthenticatedAccountMenu({user, logout}: AuthenticatedAccountMenuProps) {
    const menuId = useId();

    const containerRef = useRef<HTMLDivElement | null>(null);

    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const firstActionRef = useRef<HTMLAnchorElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        /*
         * عند فتح القائمة ننقل Focus إلى أول إجراء.
         * هذا يجعل الاستخدام بلوحة المفاتيح واضحًا بدل
         * ترك المستخدم على زر فتح القائمة.
         */
        firstActionRef.current?.focus();

        function handlePointerDown(event: PointerEvent): void {
            const target = event.target;

            if (target instanceof Node && !containerRef.current?.contains(target)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent): void {
            if (event.key !== "Escape") {
                return;
            }

            event.preventDefault();

            setIsOpen(false);
            triggerRef.current?.focus();
        }

        document.addEventListener("pointerdown", handlePointerDown);

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);

            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    async function handleLogout(): Promise<void> {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await logout();

            sndToast.success({
                title: "تم تسجيل الخروج",
                description: "أزلنا بيانات جلستك الخاصة وأنهينا جلسة التجديد.",
            });
        } catch {
            /*
             * AuthProvider نفذت Local Logout قبل الشبكة.
             * لا نعيد الحساب إلى authenticated عند فشل Render.
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

    function closeMenu(): void {
        setIsOpen(false);
    }

    return (
        <div ref={containerRef} className="relative">
            <button
                ref={triggerRef}
                type="button"
                aria-expanded={isOpen}
                aria-controls={menuId}
                aria-label={`فتح قائمة حساب ${user.name}`}
                onClick={() => {
                    setIsOpen((current) => !current);
                }}
                className={cn(
                    "group flex min-h-11 items-center gap-2 rounded-2xl border border-transparent p-1.5 pe-2.5 text-start transition-[background-color,border-color,box-shadow]",
                    "hover:border-brand/15 hover:bg-surface-muted",
                    "focus-visible:border-brand/30",
                    isOpen && "border-brand/20 bg-surface-raised shadow-lg"
                )}
            >
                <Avatar
                    name={user.name}
                    imageUrl={user.avatar}
                    sizes="36px"
                    className="size-9 border-2 border-background ring-2 ring-brand/15"
                />

                <span className="hidden min-w-0 lg:grid">
                    <span className="text-[0.65rem] font-semibold text-muted-foreground">حسابي</span>

                    <span title={user.name} className="max-w-28 truncate text-sm font-bold text-foreground">
                        {user.name}
                    </span>
                </span>

                <ChevronDown
                    aria-hidden="true"
                    className={cn(
                        "size-4 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180"
                    )}
                />
            </button>

            {isOpen ? (
                <div
                    id={menuId}
                    aria-label="قائمة الحساب"
                    className="absolute end-0 top-[calc(100%+0.75rem)] z-50 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-border bg-surface-raised shadow-2xl"
                >
                    <div className="flex items-center gap-3 border-b border-border bg-brand/5 p-4">
                        <Avatar
                            name={user.name}
                            imageUrl={user.avatar}
                            sizes="56px"
                            className="size-14 border-2 border-background text-lg ring-2 ring-brand/15"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-brand">حسابك في سند</p>

                            <p title={user.name} className="mt-0.5 truncate font-bold text-foreground">
                                {user.name}
                            </p>

                            <p
                                dir="ltr"
                                title={user.email}
                                className="mt-0.5 truncate text-left text-xs text-muted-foreground"
                            >
                                {user.email}
                            </p>
                        </div>
                    </div>

                    <nav aria-label="إدارة الحساب" className="grid gap-1 p-2">
                        <Link
                            ref={firstActionRef}
                            href="/profile"
                            onClick={closeMenu}
                            className="flex min-h-14 items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-surface-muted"
                        >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand">
                                <Settings2 aria-hidden="true" className="size-5" />
                            </span>

                            <span className="grid min-w-0">
                                <span className="font-semibold text-foreground">إدارة الملف الشخصي</span>

                                <span className="text-xs leading-5 text-muted-foreground">
                                    تعديل الاسم وصورة الحساب
                                </span>
                            </span>
                        </Link>

                        <Link
                            href="/profile#profile-avatar"
                            onClick={closeMenu}
                            className="flex min-h-14 items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-surface-muted"
                        >
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-foreground">
                                <Camera aria-hidden="true" className="size-5" />
                            </span>

                            <span className="grid min-w-0">
                                <span className="font-semibold text-foreground">تغيير صورة الحساب</span>

                                <span className="text-xs leading-5 text-muted-foreground">
                                    الانتقال مباشرة إلى قسم الصورة
                                </span>
                            </span>
                        </Link>
                    </nav>

                    <div className="border-t border-border p-2">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isLoggingOut}
                            aria-busy={isLoggingOut}
                            onClick={() => {
                                void handleLogout();
                            }}
                            className="w-full justify-start text-danger hover:bg-danger/10 hover:text-danger"
                        >
                            {isLoggingOut ? (
                                <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                            ) : (
                                <LogOut aria-hidden="true" />
                            )}

                            {isLoggingOut ? "جار تسجيل الخروج" : "تسجيل الخروج"}
                        </Button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

export function AuthHeaderActions() {
    const {status, user, sessionError, logout, retrySession} = useAuth();

    const [isRetryingSession, setIsRetryingSession] = useState(false);

    async function handleRetrySession(): Promise<void> {
        if (isRetryingSession) {
            return;
        }

        setIsRetryingSession(true);

        try {
            await retrySession();
        } catch {
            sndToast.warning({
                title: "تعذر التحقق من الجلسة",
                description: "تحقق من اتصالك بالإنترنت ثم حاول مرة أخرى.",
                durationMs: 0,
            });
        } finally {
            setIsRetryingSession(false);
        }
    }

    /*
     * checking لا تعني Anonymous.
     *
     * عند Network Error نبقى في checking ونقدم Retry،
     * ولا نعرض Login/Register كأن الجلسة غير موجودة.
     */
    if (status === "checking") {
        if (sessionError) {
            return (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isRetryingSession}
                    aria-busy={isRetryingSession}
                    aria-label="إعادة محاولة التحقق من الجلسة"
                    onClick={() => {
                        void handleRetrySession();
                    }}
                >
                    {isRetryingSession ? (
                        <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                    ) : (
                        <RotateCcw aria-hidden="true" />
                    )}

                    <span className="hidden sm:inline">{isRetryingSession ? "جار التحقق" : "إعادة الاتصال"}</span>
                </Button>
            );
        }

        return (
            <span
                role="status"
                aria-label="جار التحقق من الجلسة"
                className="grid size-11 place-items-center rounded-xl text-muted-foreground"
            >
                <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
            </span>
        );
    }

    if (status === "authenticated" && user) {
        return <AuthenticatedAccountMenu user={user} logout={logout} />;
    }

    return (
        <div role="group" aria-label="الدخول إلى الحساب" className="flex items-center gap-1">
            <Link
                href="/login"
                aria-label="تسجيل الدخول"
                className={cn(
                    buttonVariants({
                        variant: "ghost",
                        size: "sm",
                    }),
                    "px-2.5"
                )}
            >
                <LogIn aria-hidden="true" />

                <span className="hidden sm:inline">دخول</span>
            </Link>

            <Link
                href="/register"
                className={cn(
                    buttonVariants({
                        size: "sm",
                    }),
                    "hidden lg:inline-flex"
                )}
            >
                <UserRoundPlus aria-hidden="true" />
                إنشاء حساب
            </Link>
        </div>
    );
}
