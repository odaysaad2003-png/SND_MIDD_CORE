import {Menu} from "lucide-react";

import {ActiveNavLink} from "@/components/navigation/active-nav-link";

export function PublicMobileNavigation() {
    return (
        <details className="group relative md:hidden">
            <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-border bg-surface text-foreground transition-colors hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
                <Menu aria-hidden="true" className="size-5" />
                <span className="sr-only">فتح قائمة التنقل</span>
            </summary>
            <nav
                aria-label="التنقل العام على الهاتف"
                className="absolute end-0 top-[calc(100%+0.75rem)] z-50 grid min-w-56 gap-1 rounded-2xl border border-border bg-surface-raised p-2 shadow-2xl"
            >
                <ActiveNavLink href="/">الرئيسية</ActiveNavLink>
                <ActiveNavLink href="/posts" match="prefix">المنشورات العامة</ActiveNavLink>
                <ActiveNavLink href="/#how-it-works">كيف يعمل سند؟</ActiveNavLink>
                <ActiveNavLink href="/#trust-and-safety">الثقة والسلامة</ActiveNavLink>
            </nav>
        </details>
    );
}
