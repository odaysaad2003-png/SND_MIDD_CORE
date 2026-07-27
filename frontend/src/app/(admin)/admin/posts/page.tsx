import type {Metadata} from "next";

import {AdminPosts} from "@/features/admin/components/admin-posts";
import {
    parseAdminPostsUrlState,
    type AdminRawSearchParams,
} from "@/features/admin/lib/admin-url-state";

export const metadata: Metadata = {
    title: "إدارة المنشورات",
};

export default async function AdminPostsPage({
    searchParams,
}: Readonly<{
    searchParams: Promise<AdminRawSearchParams>;
}>) {
    const state = parseAdminPostsUrlState(await searchParams);
    return <AdminPosts state={state} />;
}
