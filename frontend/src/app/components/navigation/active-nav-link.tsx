"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import type {ComponentProps} from "react";

import {cn} from "@/lib/utils/cn";

type ActiveNavLinkProps = ComponentProps<typeof Link> &
    Readonly<{
        match?: "exact" | "prefix";
    }>;

export function ActiveNavLink({className, href, match = "exact", ...props}: ActiveNavLinkProps) {
    const pathname = usePathname();
    const hrefPath = typeof href === "string" ? href : href.pathname ?? "";
    const isActive =
        match === "exact"
            ? pathname === hrefPath
            : pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);

    return (
        <Link
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
                "inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground aria-[current=page]:bg-brand/10 aria-[current=page]:text-brand aria-[current=page]:shadow-[inset_0_-2px_0_var(--brand)]",
                className
            )}
            {...props}
        />
    );
}
