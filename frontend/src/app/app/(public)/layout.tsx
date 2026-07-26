import type {ReactNode} from "react";

import {PublicFooter} from "@/components/layout/public-footer";
import {PublicHeader} from "@/components/layout/public-header";

type PublicLayoutProps = Readonly<{
    children: ReactNode;
}>;

export default function PublicLayout({children}: PublicLayoutProps) {
    return (
        <div className="flex min-h-dvh flex-col bg-background bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--brand)_5%,transparent),transparent_32rem)]">
            <PublicHeader />
            <main className="flex-1">{children}</main>
            <PublicFooter />
        </div>
    );
}
