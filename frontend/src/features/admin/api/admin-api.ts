import {authorizedApiRequest} from "@/features/auth/api/authorized-api-client";
import {ApiError} from "@/lib/api/api-error";

import {
    ADMIN_PAGE_SIZE,
    type AdminPostsUrlState,
    type AdminReportsUrlState,
    type AdminUsersUrlState,
} from "../lib/admin-url-state";
import {
    adminDashboardResultSchema,
    adminPostResultSchema,
    adminPostsResultSchema,
    adminReportResultSchema,
    adminReportsResultSchema,
    adminUserResultSchema,
    adminUsersResultSchema,
    updateAdminPostModerationInputSchema,
    updateAdminReportStatusInputSchema,
    updateAdminUserStatusInputSchema,
    type AdminDashboardSummary,
    type AdminPostDetail,
    type AdminPostsResult,
    type AdminReport,
    type AdminReportsResult,
    type AdminUserDetail,
    type AdminUsersResult,
    type UpdateAdminPostModerationInput,
    type UpdateAdminReportStatusInput,
    type UpdateAdminUserStatusInput,
} from "../schemas/admin.schema";

type RequestOptions = Readonly<{
    signal?: AbortSignal;
}>;

function invalidAdminResponse(resource: string): ApiError {
    return new ApiError({
        kind: "invalid-response",
        message: `The ${resource} response does not match the verified admin API contract`,
    });
}

function buildPaginatedPath(
    path: string,
    entries: ReadonlyArray<readonly [string, string | number | undefined]>
): string {
    const searchParams = new URLSearchParams({
        page: String(entries.find(([key]) => key === "page")?.[1] ?? 1),
        limit: String(ADMIN_PAGE_SIZE),
    });

    entries.forEach(([key, value]) => {
        if (key !== "page" && value !== undefined && value !== "") {
            searchParams.set(key, String(value));
        }
    });

    return `${path}?${searchParams.toString()}`;
}

export async function getAdminDashboardSummary(options: RequestOptions = {}): Promise<AdminDashboardSummary> {
    const result = await authorizedApiRequest<unknown>("admin/dashboard/summary", {
        method: "GET",
        signal: options.signal,
    });
    const parsed = adminDashboardResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("dashboard summary");
    }

    return parsed.data.data;
}

export async function getAdminUsers(
    state: AdminUsersUrlState,
    options: RequestOptions = {}
): Promise<AdminUsersResult> {
    const path = buildPaginatedPath("admin/users", [
        ["page", state.page],
        ["q", state.q],
        ["status", state.status],
        ["role", state.role],
        ["sort", state.sort],
    ]);
    const result = await authorizedApiRequest<unknown, unknown>(path, {
        method: "GET",
        signal: options.signal,
    });
    const parsed = adminUsersResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("admin users");
    }

    return parsed.data;
}

export async function getAdminUser(userId: string, options: RequestOptions = {}): Promise<AdminUserDetail> {
    const result = await authorizedApiRequest<unknown>(`admin/users/${encodeURIComponent(userId)}`, {
        method: "GET",
        signal: options.signal,
    });
    const parsed = adminUserResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("admin user detail");
    }

    return parsed.data.data;
}

export async function updateAdminUserStatus(
    userId: string,
    input: UpdateAdminUserStatusInput,
    options: RequestOptions = {}
): Promise<AdminUserDetail> {
    const payload = updateAdminUserStatusInputSchema.parse(input);
    const result = await authorizedApiRequest<unknown>(`admin/users/${encodeURIComponent(userId)}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: options.signal,
    });
    const parsed = adminUserResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("updated admin user");
    }

    return parsed.data.data;
}

export async function getAdminPosts(
    state: AdminPostsUrlState,
    options: RequestOptions = {}
): Promise<AdminPostsResult> {
    const path = buildPaginatedPath("admin/posts", [
        ["page", state.page],
        ["q", state.q],
        ["lifecycleStatus", state.lifecycleStatus],
        ["moderationStatus", state.moderationStatus],
        ["sort", state.sort],
    ]);
    const result = await authorizedApiRequest<unknown, unknown>(path, {
        method: "GET",
        signal: options.signal,
    });
    const parsed = adminPostsResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("admin posts");
    }

    return parsed.data;
}

export async function getAdminPost(postId: string, options: RequestOptions = {}): Promise<AdminPostDetail> {
    const result = await authorizedApiRequest<unknown>(`admin/posts/${encodeURIComponent(postId)}`, {
        method: "GET",
        signal: options.signal,
    });
    const parsed = adminPostResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("admin post detail");
    }

    return parsed.data.data;
}

export async function updateAdminPostModeration(
    postId: string,
    input: UpdateAdminPostModerationInput,
    options: RequestOptions = {}
): Promise<AdminPostDetail> {
    const payload = updateAdminPostModerationInputSchema.parse(input);
    const result = await authorizedApiRequest<unknown>(`admin/posts/${encodeURIComponent(postId)}/moderation`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: options.signal,
    });
    const parsed = adminPostResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("updated admin post");
    }

    return parsed.data.data;
}

export async function getAdminReports(
    state: AdminReportsUrlState,
    options: RequestOptions = {}
): Promise<AdminReportsResult> {
    const path = buildPaginatedPath("reports", [
        ["page", state.page],
        ["status", state.status],
        ["targetType", state.targetType],
        ["reason", state.reason],
        ["sort", state.sort],
    ]);
    const result = await authorizedApiRequest<unknown, unknown>(path, {
        method: "GET",
        signal: options.signal,
    });
    const parsed = adminReportsResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("admin reports");
    }

    return parsed.data;
}

export async function getAdminReport(reportId: string, options: RequestOptions = {}): Promise<AdminReport> {
    const result = await authorizedApiRequest<unknown>(`reports/${encodeURIComponent(reportId)}`, {
        method: "GET",
        signal: options.signal,
    });
    const parsed = adminReportResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("admin report detail");
    }

    return parsed.data.data;
}

export async function updateAdminReportStatus(
    reportId: string,
    input: UpdateAdminReportStatusInput,
    options: RequestOptions = {}
): Promise<AdminReport> {
    const payload = updateAdminReportStatusInputSchema.parse(input);
    const result = await authorizedApiRequest<unknown>(`reports/${encodeURIComponent(reportId)}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: options.signal,
    });
    const parsed = adminReportResultSchema.safeParse(result);

    if (!parsed.success) {
        throw invalidAdminResponse("updated admin report");
    }

    return parsed.data.data;
}
