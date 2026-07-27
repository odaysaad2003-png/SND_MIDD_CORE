import {keepPreviousData, queryOptions} from "@tanstack/react-query";

import {
    getAdminDashboardSummary,
    getAdminPost,
    getAdminPosts,
    getAdminReport,
    getAdminReports,
    getAdminUser,
    getAdminUsers,
} from "../api/admin-api";
import type {AdminPostsUrlState, AdminReportsUrlState, AdminUsersUrlState} from "../lib/admin-url-state";

const adminRootKey = ["admin"] as const;
const adminUsersRootKey = [...adminRootKey, "users"] as const;
const adminPostsRootKey = [...adminRootKey, "posts"] as const;
const adminReportsRootKey = [...adminRootKey, "reports"] as const;

export const adminKeys = {
    all: adminRootKey,
    summary: [...adminRootKey, "summary"] as const,
    users: {
        all: adminUsersRootKey,
        lists: [...adminUsersRootKey, "list"] as const,
        list: (state: AdminUsersUrlState) => [...adminUsersRootKey, "list", state] as const,
        detail: (userId: string) => [...adminUsersRootKey, "detail", userId] as const,
    },
    posts: {
        all: adminPostsRootKey,
        lists: [...adminPostsRootKey, "list"] as const,
        list: (state: AdminPostsUrlState) => [...adminPostsRootKey, "list", state] as const,
        detail: (postId: string) => [...adminPostsRootKey, "detail", postId] as const,
    },
    reports: {
        all: adminReportsRootKey,
        lists: [...adminReportsRootKey, "list"] as const,
        list: (state: AdminReportsUrlState) => [...adminReportsRootKey, "list", state] as const,
        detail: (reportId: string) => [...adminReportsRootKey, "detail", reportId] as const,
    },
};

const privateQueryMeta = {
    authScope: "private",
} as const;

export function adminDashboardQueryOptions() {
    return queryOptions({
        queryKey: adminKeys.summary,
        queryFn: ({signal}) => getAdminDashboardSummary({signal}),
        staleTime: 30_000,
        retry: false,
        meta: privateQueryMeta,
    });
}

export function adminUsersQueryOptions(state: AdminUsersUrlState) {
    return queryOptions({
        queryKey: adminKeys.users.list(state),
        queryFn: ({signal}) => getAdminUsers(state, {signal}),
        placeholderData: keepPreviousData,
        staleTime: 20_000,
        retry: false,
        meta: privateQueryMeta,
    });
}

export function adminUserDetailQueryOptions(userId: string) {
    return queryOptions({
        queryKey: adminKeys.users.detail(userId),
        queryFn: ({signal}) => getAdminUser(userId, {signal}),
        staleTime: 20_000,
        retry: false,
        meta: privateQueryMeta,
    });
}

export function adminPostsQueryOptions(state: AdminPostsUrlState) {
    return queryOptions({
        queryKey: adminKeys.posts.list(state),
        queryFn: ({signal}) => getAdminPosts(state, {signal}),
        placeholderData: keepPreviousData,
        staleTime: 20_000,
        retry: false,
        meta: privateQueryMeta,
    });
}

export function adminPostDetailQueryOptions(postId: string) {
    return queryOptions({
        queryKey: adminKeys.posts.detail(postId),
        queryFn: ({signal}) => getAdminPost(postId, {signal}),
        staleTime: 20_000,
        retry: false,
        meta: privateQueryMeta,
    });
}

export function adminReportsQueryOptions(state: AdminReportsUrlState) {
    return queryOptions({
        queryKey: adminKeys.reports.list(state),
        queryFn: ({signal}) => getAdminReports(state, {signal}),
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        retry: false,
        meta: privateQueryMeta,
    });
}

export function adminReportDetailQueryOptions(reportId: string) {
    return queryOptions({
        queryKey: adminKeys.reports.detail(reportId),
        queryFn: ({signal}) => getAdminReport(reportId, {signal}),
        staleTime: 15_000,
        retry: false,
        meta: privateQueryMeta,
    });
}
