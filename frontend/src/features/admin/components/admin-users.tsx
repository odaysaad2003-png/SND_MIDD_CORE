"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CalendarDays, Eye, Mail, Search, Shield, UserRoundCheck, UserRoundX} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Avatar} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {useAuth} from "@/features/auth/providers/auth-provider";

import {updateAdminUserStatus} from "../api/admin-api";
import {formatAdminDate, getAdminErrorContent} from "../lib/admin-display";
import {
    buildAdminUsersHref,
    type AdminUsersUrlState,
} from "../lib/admin-url-state";
import {
    adminKeys,
    adminUserDetailQueryOptions,
    adminUsersQueryOptions,
} from "../queries/admin.queries";
import type {AdminUserSummary} from "../schemas/admin.schema";
import {
    AdminActionDialog,
    AdminBadge,
    AdminDetailSkeleton,
    AdminEmptyState,
    AdminErrorState,
    AdminPageHeader,
    AdminPageSkeleton,
    AdminPagination,
    buildAdminFilterHrefFromForm,
} from "./admin-ui";

type UserStatusAction = Readonly<{
    user: AdminUserSummary;
    status: "active" | "suspended";
}>;

export function AdminUsers({state}: Readonly<{state: AdminUsersUrlState}>) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const {user: currentAdmin} = useAuth();
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [statusAction, setStatusAction] = useState<UserStatusAction | null>(null);

    const usersQuery = useQuery(adminUsersQueryOptions(state));
    const detailQuery = useQuery({
        ...adminUserDetailQueryOptions(selectedUserId ?? ""),
        enabled: Boolean(selectedUserId),
    });

    const statusMutation = useMutation({
        mutationFn: async ({userId, status, reason}: {userId: string; status: "active" | "suspended"; reason: string}) =>
            updateAdminUserStatus(userId, {status, reason}),
        onSuccess: async (updatedUser) => {
            queryClient.setQueryData(adminKeys.users.detail(updatedUser.id), updatedUser);
            await Promise.all([
                queryClient.invalidateQueries({queryKey: adminKeys.users.lists}),
                queryClient.invalidateQueries({queryKey: adminKeys.summary}),
            ]);

            sndToast.success({
                title: updatedUser.isActive ? "تمت إعادة تفعيل الحساب" : "تم إيقاف الحساب",
                description: `تم تأكيد حالة حساب ${updatedUser.name} من الخادم.`,
            });
            setStatusAction(null);
        },
        onError: (error) => {
            const content = getAdminErrorContent(error, "تحديث حالة المستخدم");
            sndToast.error({
                title: content.title,
                description: content.description,
                durationMs: 0,
            });
        },
    });

    if (usersQuery.isPending) {
        return <AdminPageSkeleton />;
    }

    const filtered = Boolean(state.q || state.status || state.role || state.sort !== "latest");
    const pageOutOfRange = Boolean(
        usersQuery.data &&
            usersQuery.data.data.length === 0 &&
            usersQuery.data.meta.totalPages > 0 &&
            state.page > usersQuery.data.meta.totalPages
    );

    return (
        <div className="grid gap-6" aria-busy={usersQuery.isFetching}>
            <AdminPageHeader
                eyebrow="الحسابات والصلاحيات"
                title="إدارة المستخدمين"
                description="ابحث في الحسابات وراجع تفاصيلها وأوقف أو أعد تفعيل المستخدمين العاديين وفق عقد الخادم."
            />

            <form
                action="/admin/users"
                method="get"
                role="search"
                onSubmit={(event) => {
                    event.preventDefault();
                    router.push(buildAdminFilterHrefFromForm("/admin/users", event.currentTarget));
                }}
                className="grid gap-4 rounded-[1.75rem] border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_11rem_11rem_11rem_auto] xl:items-end"
            >
                <div className="grid gap-2 sm:col-span-2 xl:col-span-1">
                    <label htmlFor="admin-user-search" className="text-sm font-bold text-foreground">
                        الاسم أو البريد الإلكتروني
                    </label>
                    <div className="relative">
                        <Search
                            aria-hidden="true"
                            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                        />
                        <Input
                            id="admin-user-search"
                            name="q"
                            defaultValue={state.q ?? ""}
                            maxLength={100}
                            dir="auto"
                            placeholder="ابحث بدقة"
                            className="ps-10"
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-user-status" className="text-sm font-bold text-foreground">
                        الحالة
                    </label>
                    <select
                        id="admin-user-status"
                        name="status"
                        defaultValue={state.status ?? ""}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="">كل الحالات</option>
                        <option value="active">نشط</option>
                        <option value="suspended">موقوف</option>
                    </select>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-user-role" className="text-sm font-bold text-foreground">
                        الدور
                    </label>
                    <select
                        id="admin-user-role"
                        name="role"
                        defaultValue={state.role ?? ""}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="">كل الأدوار</option>
                        <option value="user">مستخدم</option>
                        <option value="admin">مشرف</option>
                    </select>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-user-sort" className="text-sm font-bold text-foreground">
                        الترتيب
                    </label>
                    <select
                        id="admin-user-sort"
                        name="sort"
                        defaultValue={state.sort}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="latest">الأحدث</option>
                        <option value="oldest">الأقدم</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <Button type="submit" className="flex-1 xl:flex-none">
                        تطبيق
                    </Button>
                    {filtered ? (
                        <Button asChild variant="ghost" className="flex-1 xl:flex-none">
                            <Link href="/admin/users">مسح</Link>
                        </Button>
                    ) : null}
                </div>
            </form>

            {usersQuery.isError ? (
                <AdminErrorState
                    content={getAdminErrorContent(usersQuery.error, "قائمة المستخدمين")}
                    isRetrying={usersQuery.isFetching}
                    onRetry={() => {
                        void usersQuery.refetch();
                    }}
                />
            ) : usersQuery.data.data.length === 0 ? (
                <AdminEmptyState
                    filtered={filtered || pageOutOfRange}
                    title={
                        pageOutOfRange
                            ? "هذه الصفحة لم تعد متاحة"
                            : filtered
                              ? "لا توجد حسابات تطابق الفلاتر"
                              : "لا توجد حسابات بعد"
                    }
                    description={
                        pageOutOfRange
                            ? "ربما تغيّر عدد النتائج بعد تنفيذ إجراء إداري."
                            : filtered
                            ? "جرّب بحثًا أقصر أو أزل بعض الفلاتر."
                            : "ستظهر الحسابات هنا فور إنشائها في المنصة."
                    }
                    resetHref={
                        pageOutOfRange
                            ? buildAdminUsersHref({...state, page: usersQuery.data.meta.totalPages})
                            : "/admin/users"
                    }
                    actionLabel={pageOutOfRange ? "الانتقال إلى آخر صفحة متاحة" : "مسح الفلاتر"}
                />
            ) : (
                <section className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                        <p>
                            <strong className="text-foreground">{usersQuery.data.meta.total}</strong> حسابًا ضمن النتائج
                        </p>
                        <p aria-live="polite" className={usersQuery.isFetching ? "opacity-100" : "opacity-0"}>
                            جار تحديث القائمة…
                        </p>
                    </div>

                    <ul
                        className={`grid gap-4 transition-opacity ${
                            usersQuery.isPlaceholderData ? "opacity-60" : "opacity-100"
                        }`}
                    >
                        {usersQuery.data.data.map((user) => {
                            const isCurrentAdmin = currentAdmin?.id === user.id;
                            const canChangeStatus = user.role === "user" && !isCurrentAdmin;

                            return (
                                <li
                                    key={user.id}
                                    className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5"
                                >
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                                        <div className="flex min-w-0 flex-1 items-start gap-3">
                                            <Avatar name={user.name} imageUrl={user.avatar} sizes="48px" className="size-12" />
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate font-black text-foreground">{user.name}</h3>
                                                    <AdminBadge tone={user.role === "admin" ? "brand" : "muted"}>
                                                        {user.role === "admin" ? "مشرف" : "مستخدم"}
                                                    </AdminBadge>
                                                    <AdminBadge tone={user.isActive ? "success" : "danger"}>
                                                        {user.isActive ? "نشط" : "موقوف"}
                                                    </AdminBadge>
                                                    {isCurrentAdmin ? <AdminBadge tone="info">حسابك</AdminBadge> : null}
                                                </div>
                                                <p
                                                    dir="ltr"
                                                    className="mt-1 flex items-center gap-2 truncate text-left text-sm text-muted-foreground"
                                                >
                                                    <Mail aria-hidden="true" className="size-4 shrink-0" />
                                                    {user.email}
                                                </p>
                                                <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <CalendarDays aria-hidden="true" className="size-4" />
                                                    انضم في {formatAdminDate(user.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => setSelectedUserId(user.id)}
                                            >
                                                <Eye aria-hidden="true" />
                                                التفاصيل
                                            </Button>

                                            {canChangeStatus ? (
                                                <Button
                                                    type="button"
                                                    variant={user.isActive ? "danger" : "secondary"}
                                                    onClick={() =>
                                                        setStatusAction({
                                                            user,
                                                            status: user.isActive ? "suspended" : "active",
                                                        })
                                                    }
                                                >
                                                    {user.isActive ? (
                                                        <UserRoundX aria-hidden="true" />
                                                    ) : (
                                                        <UserRoundCheck aria-hidden="true" />
                                                    )}
                                                    {user.isActive ? "إيقاف الحساب" : "إعادة التفعيل"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    disabled
                                                    title={
                                                        isCurrentAdmin
                                                            ? "لا يمكن تغيير حالة حسابك"
                                                            : "لا يسمح العقد بتغيير حالة حساب مشرف"
                                                    }
                                                >
                                                    <Shield aria-hidden="true" />
                                                    حساب محمي
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <AdminPagination
                        meta={usersQuery.data.meta}
                        buildHref={(page) => buildAdminUsersHref({...state, page})}
                    />
                </section>
            )}

            <ModalDialog
                open={Boolean(selectedUserId)}
                title="تفاصيل المستخدم"
                description="بيانات إدارية محدودة من العقد الآمن."
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedUserId(null);
                    }
                }}
            >
                {detailQuery.isPending ? (
                    <AdminDetailSkeleton />
                ) : detailQuery.isError ? (
                    <AdminErrorState
                        content={getAdminErrorContent(detailQuery.error, "تفاصيل المستخدم")}
                        isRetrying={detailQuery.isFetching}
                        onRetry={() => {
                            void detailQuery.refetch();
                        }}
                    />
                ) : (
                    <div className="grid gap-5">
                        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
                            <Avatar
                                name={detailQuery.data.name}
                                imageUrl={detailQuery.data.avatar}
                                sizes="64px"
                                className="size-16 text-xl"
                            />
                            <div className="min-w-0">
                                <h3 className="truncate text-xl font-black text-foreground">{detailQuery.data.name}</h3>
                                <p dir="ltr" className="truncate text-left text-sm text-muted-foreground">
                                    {detailQuery.data.email}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    <AdminBadge tone={detailQuery.data.role === "admin" ? "brand" : "muted"}>
                                        {detailQuery.data.role === "admin" ? "مشرف" : "مستخدم"}
                                    </AdminBadge>
                                    <AdminBadge tone={detailQuery.data.isActive ? "success" : "danger"}>
                                        {detailQuery.data.isActive ? "نشط" : "موقوف"}
                                    </AdminBadge>
                                </div>
                            </div>
                        </div>

                        <dl className="grid gap-3 rounded-2xl border border-border bg-surface-muted/50 p-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold text-muted-foreground">تاريخ التسجيل</dt>
                                <dd className="mt-1 font-semibold text-foreground">
                                    {formatAdminDate(detailQuery.data.createdAt)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-muted-foreground">آخر تحديث للحساب</dt>
                                <dd className="mt-1 font-semibold text-foreground">
                                    {formatAdminDate(detailQuery.data.updatedAt)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-muted-foreground">تاريخ الإيقاف</dt>
                                <dd className="mt-1 font-semibold text-foreground">
                                    {detailQuery.data.suspendedAt
                                        ? formatAdminDate(detailQuery.data.suspendedAt)
                                        : "غير موقوف"}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold text-muted-foreground">نفّذ الإيقاف</dt>
                                <dd className="mt-1 font-semibold text-foreground">
                                    {detailQuery.data.suspendedBy?.name ?? "—"}
                                </dd>
                            </div>
                        </dl>

                        {detailQuery.data.suspensionReason ? (
                            <div className="rounded-2xl border border-danger/20 bg-danger/8 p-4">
                                <p className="text-xs font-bold text-danger">سبب الإيقاف</p>
                                <p className="mt-2 whitespace-pre-wrap leading-7 text-foreground">
                                    {detailQuery.data.suspensionReason}
                                </p>
                            </div>
                        ) : null}
                    </div>
                )}
            </ModalDialog>

            {statusAction ? (
                <AdminActionDialog
                    open
                    title={statusAction.status === "suspended" ? "تأكيد إيقاف الحساب" : "تأكيد إعادة تفعيل الحساب"}
                    description={
                        <>
                            سيُطبّق الإجراء على <strong>{statusAction.user.name}</strong>. إيقاف الحساب يلغي جلسة
                            التجديد الحالية، والمستخدم يحتاج لتسجيل الدخول مجددًا بعد إعادة التفعيل.
                        </>
                    }
                    inputLabel="سبب القرار"
                    inputPlaceholder="اكتب سببًا واضحًا وقابلًا للمراجعة"
                    confirmLabel={statusAction.status === "suspended" ? "إيقاف الحساب" : "إعادة التفعيل"}
                    pendingLabel="جار حفظ القرار"
                    minLength={5}
                    maxLength={500}
                    danger={statusAction.status === "suspended"}
                    isPending={statusMutation.isPending}
                    serverError={
                        statusMutation.isError
                            ? getAdminErrorContent(statusMutation.error, "تحديث حالة المستخدم").description
                            : null
                    }
                    onConfirm={(reason) => {
                        statusMutation.mutate({
                            userId: statusAction.user.id,
                            status: statusAction.status,
                            reason,
                        });
                    }}
                    onOpenChange={(open) => {
                        if (!open && !statusMutation.isPending) {
                            statusMutation.reset();
                            setStatusAction(null);
                        }
                    }}
                />
            ) : null}
        </div>
    );
}
