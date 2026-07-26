import type {Metadata} from "next";
import type {ReactNode} from "react";

import {PublicFooter} from "@/components/layout/public-footer";
import {PublicHeader} from "@/components/layout/public-header";
import {ProtectedRouteGate} from "@/features/auth/components/protected-route-gate";

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

type ProtectedLayoutProps = Readonly<{
    children: ReactNode;
}>;

export default function ProtectedLayout({children}: ProtectedLayoutProps) {
    return (
        <div className="flex min-h-dvh flex-col bg-background bg-[radial-gradient(circle_at_top_left,color-mix(in_oklch,var(--brand)_5%,transparent),transparent_32rem)]">
            <PublicHeader />

            <main className="flex-1">
                <ProtectedRouteGate>{children}</ProtectedRouteGate>
            </main>

            <PublicFooter />
        </div>
    );
}
