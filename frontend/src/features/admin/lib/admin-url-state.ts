import {z} from "zod";

import {reportReasons, reportStatuses, type ReportReason, type ReportStatus} from "../schemas/admin.schema";

export const ADMIN_PAGE_SIZE = 10;

export type AdminRawSearchParams = Record<string, string | string[] | undefined>;

export type AdminUsersUrlState = Readonly<{
    page: number;
    q?: string;
    status?: "active" | "suspended";
    role?: "user" | "admin";
    sort: "latest" | "oldest";
}>;

export type AdminPostsUrlState = Readonly<{
    page: number;
    q?: string;
    lifecycleStatus?: "active" | "deleted";
    moderationStatus?: "visible" | "hidden";
    sort: "latest" | "oldest";
}>;

export type AdminReportsUrlState = Readonly<{
    page: number;
    status?: ReportStatus;
    targetType?: "post" | "comment";
    reason?: ReportReason;
    sort: "latest" | "oldest";
}>;

function getFirstValue(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined): number {
    const result = z.coerce.number().int().positive().safeParse(getFirstValue(value));
    return result.success ? result.data : 1;
}

function parseOptionalQuery(value: string | string[] | undefined): string | undefined {
    const result = z.string().trim().max(100).safeParse(getFirstValue(value));
    return result.success && result.data ? result.data : undefined;
}

function parseSort(value: string | string[] | undefined): "latest" | "oldest" {
    const result = z.enum(["latest", "oldest"]).safeParse(getFirstValue(value));
    return result.success ? result.data : "latest";
}

export function parseAdminUsersUrlState(searchParams: AdminRawSearchParams): AdminUsersUrlState {
    const statusResult = z.enum(["active", "suspended"]).safeParse(getFirstValue(searchParams.status));
    const roleResult = z.enum(["user", "admin"]).safeParse(getFirstValue(searchParams.role));
    const q = parseOptionalQuery(searchParams.q);

    return {
        page: parsePage(searchParams.page),
        sort: parseSort(searchParams.sort),
        ...(q ? {q} : {}),
        ...(statusResult.success ? {status: statusResult.data} : {}),
        ...(roleResult.success ? {role: roleResult.data} : {}),
    };
}

export function parseAdminPostsUrlState(searchParams: AdminRawSearchParams): AdminPostsUrlState {
    const lifecycleResult = z.enum(["active", "deleted"]).safeParse(getFirstValue(searchParams.lifecycleStatus));
    const moderationResult = z.enum(["visible", "hidden"]).safeParse(getFirstValue(searchParams.moderationStatus));
    const q = parseOptionalQuery(searchParams.q);

    return {
        page: parsePage(searchParams.page),
        sort: parseSort(searchParams.sort),
        ...(q ? {q} : {}),
        ...(lifecycleResult.success ? {lifecycleStatus: lifecycleResult.data} : {}),
        ...(moderationResult.success ? {moderationStatus: moderationResult.data} : {}),
    };
}

export function parseAdminReportsUrlState(searchParams: AdminRawSearchParams): AdminReportsUrlState {
    const statusResult = z.enum(reportStatuses).safeParse(getFirstValue(searchParams.status));
    const targetTypeResult = z.enum(["post", "comment"]).safeParse(getFirstValue(searchParams.targetType));
    const reasonResult = z.enum(reportReasons).safeParse(getFirstValue(searchParams.reason));

    return {
        page: parsePage(searchParams.page),
        sort: parseSort(searchParams.sort),
        ...(statusResult.success ? {status: statusResult.data} : {}),
        ...(targetTypeResult.success ? {targetType: targetTypeResult.data} : {}),
        ...(reasonResult.success ? {reason: reasonResult.data} : {}),
    };
}

function buildAdminHref(path: string, entries: ReadonlyArray<readonly [string, string | number | undefined]>): string {
    const searchParams = new URLSearchParams();

    entries.forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            searchParams.set(key, String(value));
        }
    });

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
}

export function buildAdminUsersHref(state: AdminUsersUrlState): string {
    return buildAdminHref("/admin/users", [
        ["page", state.page > 1 ? state.page : undefined],
        ["q", state.q],
        ["status", state.status],
        ["role", state.role],
        ["sort", state.sort !== "latest" ? state.sort : undefined],
    ]);
}

export function buildAdminPostsHref(state: AdminPostsUrlState): string {
    return buildAdminHref("/admin/posts", [
        ["page", state.page > 1 ? state.page : undefined],
        ["q", state.q],
        ["lifecycleStatus", state.lifecycleStatus],
        ["moderationStatus", state.moderationStatus],
        ["sort", state.sort !== "latest" ? state.sort : undefined],
    ]);
}

export function buildAdminReportsHref(state: AdminReportsUrlState): string {
    return buildAdminHref("/admin/reports", [
        ["page", state.page > 1 ? state.page : undefined],
        ["status", state.status],
        ["targetType", state.targetType],
        ["reason", state.reason],
        ["sort", state.sort !== "latest" ? state.sort : undefined],
    ]);
}
