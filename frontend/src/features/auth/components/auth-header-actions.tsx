"use client";

import {ChevronDown, LoaderCircle, LogIn, LogOut, Newspaper, RotateCcw, Settings2, UserRoundPlus} from "lucide-react";
import Link from "next/link";
import {useEffect, useId, useRef, useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Avatar} from "@/components/ui/avatar";
import {Button, buttonVariants} from "@/components/ui/button";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog";
import {cn} from "@/lib/utils/cn";

import {useAuth} from "../providers/auth-provider";
import type {AuthUser} from "../schemas/auth.schema";

type AccountMenuProps = Readonly<{
    user: AuthUser;
    logout: () => Promise<void>;
}>;

function AccountMenu({user, logout}: AccountMenuProps) {
    const menuId = useId();

    const containerRef = useRef<HTMLDivElement | null>(null);

    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const firstActionRef = useRef<HTMLAnchorElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);

    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

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

    function closeMenu(): void {
        setIsOpen(false);
    }

    function openLogoutConfirmation(): void {
        setIsOpen(false);
        setIsLogoutDialogOpen(true);
    }

    function changeLogoutDialogState(open: boolean): void {
        if (isLoggingOut) {
            return;
        }

        setIsLogoutDialogOpen(open);

        if (!open) {
            window.setTimeout(() => {
                triggerRef.current?.focus();
            }, 0);
        }
    }

    async function confirmLogout(): Promise<void> {
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
             * Local Logout حدث قبل طلب الشبكة داخل AuthProvider.
             * لذلك لا نعيد المستخدم إلى authenticated.
             */
            sndToast.warning({
                title: "تم الخروج محليًا",
                description: "أزلنا بيانات الجلسة من الواجهة، لكن تعذر تأكيد إنهائها على الخادم.",
                durationMs: 0,
            });
        } finally {
            setIsLoggingOut(false);
            setIsLogoutDialogOpen(false);
        }
    }

    return (
        <>
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
                        "group flex min-h-11 items-center gap-2 rounded-2xl border border-transparent p-1.5 pe-2.5 text-start",
                        "transition-[background-color,border-color,box-shadow]",
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
                        className={cn("size-4 text-muted-foreground transition-transform", isOpen && "rotate-180")}
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
                                <p title={user.name} className="truncate font-bold text-foreground">
                                    {user.name}
                                </p>

                                <p
                                    dir="ltr"
                                    title={user.email}
                                    className="mt-1 truncate text-left text-xs text-muted-foreground"
                                >
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <nav aria-label="روابط الحساب" className="grid gap-1 p-2">
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
                                    <span className="font-semibold text-foreground">الملف الشخصي والإعدادات</span>

                                    <span className="text-xs leading-5 text-muted-foreground">
                                        تعديل الاسم والصورة وإدارة الحساب
                                    </span>
                                </span>
                            </Link>

                            <Link
                                href="/posts"
                                onClick={closeMenu}
                                className="flex min-h-14 items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-surface-muted"
                            >
                                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-foreground">
                                    <Newspaper aria-hidden="true" className="size-5" />
                                </span>

                                <span className="grid min-w-0">
                                    <span className="font-semibold text-foreground">استكشاف المنشورات</span>

                                    <span className="text-xs leading-5 text-muted-foreground">
                                        العودة إلى مجتمع سند والمنشورات العامة
                                    </span>
                                </span>
                            </Link>
                        </nav>

                        <div className="border-t border-border p-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={openLogoutConfirmation}
                                className="w-full justify-start text-danger hover:bg-danger/10 hover:text-danger"
                            >
                                <LogOut aria-hidden="true" />
                                تسجيل الخروج
                            </Button>
                        </div>
                    </div>
                ) : null}
            </div>

            <ConfirmationDialog
                open={isLogoutDialogOpen}
                title="تسجيل الخروج من سند؟"
                description={
                    <>
                        سيتم إنهاء جلسة <strong className="text-foreground">{user.name}</strong> وإزالة بيانات الحساب
                        الخاصة من هذا المتصفح.
                    </>
                }
                confirmLabel="تسجيل الخروج"
                pendingLabel="جار تسجيل الخروج"
                cancelLabel="البقاء في الحساب"
                variant="danger"
                isPending={isLoggingOut}
                onConfirm={() => {
                    void confirmLogout();
                }}
                onOpenChange={changeLogoutDialogState}
            />
        </>
    );
}

export function AuthHeaderActions() {
    const {status, user, sessionError, logout, retrySession} = useAuth();

    const [isRetryingSession, setIsRetryingSession] = useState(false);

    async function retry(): Promise<void> {
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
                        void retry();
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
        return <AccountMenu user={user} logout={logout} />;
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
