"use client";

import {
    ArrowLeft,
    FileWarning,
    Flag,
    LayoutDashboard,
    LogOut,
    Menu,
    ShieldCheck,
    Users,
    type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useState, type ReactNode} from "react";

import {BrandMark} from "@/components/brand/brand-mark";
import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {ActiveNavLink} from "@/components/navigation/active-nav-link";
import {ThemeToggle} from "@/components/theme/theme-toggle";
import {Avatar} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {useAuth} from "@/features/auth/providers/auth-provider";
import {cn} from "@/lib/utils/cn";

type AdminShellProps = Readonly<{
    children: ReactNode;
}>;

type AdminNavigationItem = Readonly<{
    href: string;
    label: string;
    description: string;
    icon: LucideIcon;
    exact?: boolean;
}>;

const navigationItems: readonly AdminNavigationItem[] = [
    {
        href: "/admin",
        label: "نظرة عامة",
        description: "ملخص حالة المنصة",
        icon: LayoutDashboard,
        exact: true,
    },
    {
        href: "/admin/users",
        label: "المستخدمون",
        description: "الحسابات وحالاتها",
        icon: Users,
    },
    {
        href: "/admin/reports",
        label: "البلاغات",
        description: "طابور المراجعة",
        icon: Flag,
    },
    {
        href: "/admin/posts",
        label: "المنشورات",
        description: "الظهور والاستعادة",
        icon: FileWarning,
    },
];

function getCurrentPageTitle(pathname: string): string {
    const current = navigationItems.find((item) =>
        item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
    );

    return current?.label ?? "لوحة الإدارة";
}

function AdminNavigation({onNavigate}: Readonly<{onNavigate?: () => void}>) {
    return (
        <nav aria-label="أقسام لوحة الإدارة" className="grid gap-2">
            {navigationItems.map(({href, label, description, icon: Icon, exact}) => (
                <ActiveNavLink
                    key={href}
                    href={href}
                    match={exact ? "exact" : "prefix"}
                    onClick={onNavigate}
                    className={cn(
                        "group min-h-16 justify-start gap-3 rounded-2xl px-3 py-2.5",
                        "aria-[current=page]:shadow-none aria-[current=page]:ring-1 aria-[current=page]:ring-brand/15"
                    )}
                >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-muted text-muted-foreground transition-colors group-aria-[current=page]:bg-brand/15 group-aria-[current=page]:text-brand">
                        <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="grid min-w-0 text-start">
                        <span className="font-bold text-current">{label}</span>
                        <span className="text-xs font-normal leading-5 text-muted-foreground">{description}</span>
                    </span>
                </ActiveNavLink>
            ))}
        </nav>
    );
}

export function AdminShell({children}: AdminShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const {user, logout} = useAuth();
    const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    async function confirmLogout(): Promise<void> {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await logout();
            sndToast.success({
                title: "تم تسجيل الخروج",
                description: "أُزيلت بيانات الإدارة الخاصة من هذا المتصفح.",
            });
        } catch {
            sndToast.warning({
                title: "تم الخروج محليًا",
                description: "أُزيلت بياناتك الخاصة، لكن تعذر تأكيد إنهاء الجلسة على الخادم.",
                durationMs: 0,
            });
        } finally {
            setIsLoggingOut(false);
            setIsLogoutOpen(false);
            router.replace("/");
        }
    }

    if (!user) {
        return null;
    }

    const pageTitle = getCurrentPageTitle(pathname);

    return (
        <div className="min-h-dvh bg-background lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="sticky top-0 hidden h-dvh border-e border-border bg-surface-raised lg:flex lg:flex-col">
                <div className="border-b border-border p-5">
                    <Link href="/admin" aria-label="لوحة إدارة سند">
                        <BrandMark priority />
                    </Link>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand/15 bg-brand/8 px-3 py-1.5 text-xs font-bold text-brand">
                        <ShieldCheck aria-hidden="true" className="size-4" />
                        مساحة إدارة محمية
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                    <AdminNavigation />
                </div>

                <div className="border-t border-border p-4">
                    <Button asChild variant="ghost" className="w-full justify-start">
                        <Link href="/posts">
                            <ArrowLeft aria-hidden="true" />
                            العودة إلى تطبيق سند
                        </Link>
                    </Button>
                </div>
            </aside>

            <div className="min-w-0">
                <header className="sticky top-0 z-30 border-b border-border bg-background/92 backdrop-blur-xl">
                    <div className="flex min-h-18 items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            aria-label="فتح قائمة أقسام الإدارة"
                            onClick={() => setIsMobileNavigationOpen(true)}
                            className="lg:hidden"
                        >
                            <Menu aria-hidden="true" />
                        </Button>

                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-brand">لوحة إدارة سند</p>
                            <h1 className="truncate text-lg font-black text-foreground sm:text-xl">{pageTitle}</h1>
                        </div>

                        <ThemeToggle />

                        <div className="hidden min-w-0 items-center gap-3 rounded-2xl border border-border bg-surface px-3 py-2 sm:flex">
                            <Avatar name={user.name} imageUrl={user.avatar} sizes="36px" className="size-9" />
                            <div className="hidden min-w-0 xl:grid">
                                <span className="max-w-36 truncate text-sm font-bold text-foreground">{user.name}</span>
                                <span className="text-[0.68rem] font-semibold text-brand">مشرف</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="تسجيل الخروج من لوحة الإدارة"
                            onClick={() => setIsLogoutOpen(true)}
                            className="text-danger hover:bg-danger/10 hover:text-danger"
                        >
                            <LogOut aria-hidden="true" />
                        </Button>
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</main>
            </div>

            <ModalDialog
                open={isMobileNavigationOpen}
                title="التنقل الإداري"
                description="اختر القسم الذي تريد إدارته."
                onOpenChange={setIsMobileNavigationOpen}
                className="lg:hidden"
                footer={
                    <Button asChild variant="secondary" className="w-full">
                        <Link href="/posts" onClick={() => setIsMobileNavigationOpen(false)}>
                            <ArrowLeft aria-hidden="true" />
                            العودة إلى تطبيق سند
                        </Link>
                    </Button>
                }
            >
                <div className="grid gap-5">
                    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-muted/60 p-3">
                        <Avatar name={user.name} imageUrl={user.avatar} sizes="44px" />
                        <div className="min-w-0">
                            <p className="truncate font-bold text-foreground">{user.name}</p>
                            <p className="text-xs font-semibold text-brand">مشرف منصة سند</p>
                        </div>
                    </div>
                    <AdminNavigation onNavigate={() => setIsMobileNavigationOpen(false)} />
                </div>
            </ModalDialog>

            <ConfirmationDialog
                open={isLogoutOpen}
                title="تسجيل الخروج من الإدارة؟"
                description="سيتم حذف بيانات الجلسة الخاصة ولوحة الإدارة من هذا المتصفح."
                confirmLabel="تسجيل الخروج"
                pendingLabel="جار تسجيل الخروج"
                isPending={isLoggingOut}
                onConfirm={() => {
                    void confirmLogout();
                }}
                onOpenChange={setIsLogoutOpen}
            />
        </div>
    );
}
