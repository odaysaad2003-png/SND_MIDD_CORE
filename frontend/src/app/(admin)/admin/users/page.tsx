import type {Metadata} from "next";

import {AdminUsers} from "@/features/admin/components/admin-users";
import {
    parseAdminUsersUrlState,
    type AdminRawSearchParams,
} from "@/features/admin/lib/admin-url-state";

export const metadata: Metadata = {
    title: "إدارة المستخدمين",
};

export default async function AdminUsersPage({
    searchParams,
}: Readonly<{
    searchParams: Promise<AdminRawSearchParams>;
}>) {
    const state = parseAdminUsersUrlState(await searchParams);
    return <AdminUsers state={state} />;
}
