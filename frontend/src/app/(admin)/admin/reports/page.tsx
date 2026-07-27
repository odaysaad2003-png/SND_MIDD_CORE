import type {Metadata} from "next";

import {AdminReports} from "@/features/admin/components/admin-reports";
import {
    parseAdminReportsUrlState,
    type AdminRawSearchParams,
} from "@/features/admin/lib/admin-url-state";

export const metadata: Metadata = {
    title: "إدارة البلاغات",
};

export default async function AdminReportsPage({
    searchParams,
}: Readonly<{
    searchParams: Promise<AdminRawSearchParams>;
}>) {
    const state = parseAdminReportsUrlState(await searchParams);
    return <AdminReports state={state} />;
}
