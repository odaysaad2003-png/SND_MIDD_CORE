import {ArrowLeft} from "lucide-react";
import Link from "next/link";

import {BrandMark} from "@/components/brand/brand-mark";
import {ActiveNavLink} from "@/components/navigation/active-nav-link";
import {ThemeToggle} from "@/components/theme/theme-toggle";
import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

import {PublicMobileNavigation} from "./public-mobile-navigation";

export function PublicHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
            <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link href="/" aria-label="سند — الرئيسية" className="rounded-xl">
                    <BrandMark priority />
                </Link>

                <nav aria-label="التنقل العام" className="hidden items-center gap-1 md:flex">
                    <ActiveNavLink href="/">الرئيسية</ActiveNavLink>
                    <ActiveNavLink href="/posts" match="prefix">
                        المنشورات
                    </ActiveNavLink>
                    <ActiveNavLink href="/#how-it-works">كيف يعمل سند؟</ActiveNavLink>
                    <ActiveNavLink href="/#trust-and-safety">الثقة والسلامة</ActiveNavLink>
                    <ActiveNavLink href="/community-guidelines"> إرشادات </ActiveNavLink>
                    <ActiveNavLink href="/privacy">مبادئ الخصوصية</ActiveNavLink>
                </nav>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <Link href="/posts" className={cn(buttonVariants({size: "sm"}), "hidden sm:inline-flex")}>
                        استكشف الآن
                        <ArrowLeft aria-hidden="true" />
                    </Link>
                    <PublicMobileNavigation />
                </div>
            </div>
        </header>
    );
}
