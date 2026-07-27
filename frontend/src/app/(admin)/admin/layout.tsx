import type {Metadata} from "next";
import type {ReactNode} from "react";

import {AdminRouteGate} from "@/features/admin/components/admin-route-gate";
import {AdminShell} from "@/features/admin/components/admin-shell";

export const metadata: Metadata = {
    title: "لوحة الإدارة",
    robots: {
        index: false,
        follow: false,
        noarchive: true,
    },
};

export default function AdminLayout({children}: Readonly<{children: ReactNode}>) {
    return (
        <AdminRouteGate>
            <AdminShell>{children}</AdminShell>
        </AdminRouteGate>
    );
}
