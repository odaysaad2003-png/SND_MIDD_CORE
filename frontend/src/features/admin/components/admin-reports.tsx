"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Eye, FileText, Flag, MessageSquare, UserRound} from "lucide-react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Avatar} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {ModalDialog} from "@/components/ui/modal-dialog";

import {updateAdminReportStatus} from "../api/admin-api";
import {
    formatAdminDate,
    getAdminErrorContent,
    reportReasonLabels,
    reportStatusLabels,
} from "../lib/admin-display";
import {
    buildAdminReportsHref,
    type AdminReportsUrlState,
} from "../lib/admin-url-state";
import {
    adminKeys,
    adminReportDetailQueryOptions,
    adminReportsQueryOptions,
} from "../queries/admin.queries";
import {
    reportReasons,
    reportStatuses,
    type AdminReport,
    type ReportReviewStatus,
} from "../schemas/admin.schema";
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

function reportStatusTone(status: (typeof reportStatuses)[number]): "warning" | "info" | "muted" | "success" {
    if (status === "pending") return "warning";
    if (status === "reviewed") return "info";
    if (status === "actioned") return "success";
    return "muted";
}

function getTargetSummary(target: NonNullable<AdminReport["target"]>): string {
    if (target.type === "post" && target.title) {
        return target.title;
    }

    return target.content.length > 120 ? `${target.content.slice(0, 120)}…` : target.content;
}

type ReviewAction = Readonly<{
    reportId: string;
    status: ReportReviewStatus;
}>;

export function AdminReports({state}: Readonly<{state: AdminReportsUrlState}>) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [reviewAction, setReviewAction] = useState<ReviewAction | null>(null);

    const reportsQuery = useQuery(adminReportsQueryOptions(state));
    const detailQuery = useQuery({
        ...adminReportDetailQueryOptions(selectedReportId ?? ""),
        enabled: Boolean(selectedReportId),
    });

    const statusMutation = useMutation({
        mutationFn: async ({
            reportId,
            status,
            adminNote,
        }: {
            reportId: string;
            status: ReportReviewStatus;
            adminNote?: string;
        }) => updateAdminReportStatus(reportId, {status, ...(adminNote ? {adminNote} : {})}),
        onSuccess: async (updatedReport) => {
            queryClient.setQueryData(adminKeys.reports.detail(updatedReport.id), updatedReport);
            await Promise.all([
                queryClient.invalidateQueries({queryKey: adminKeys.reports.lists}),
                queryClient.invalidateQueries({queryKey: adminKeys.summary}),
            ]);

            sndToast.success({
                title: "تم حفظ قرار البلاغ",
                description: `أصبحت حالة البلاغ: ${reportStatusLabels[updatedReport.status]}.`,
            });
            setReviewAction(null);
        },
        onError: (error) => {
            const content = getAdminErrorContent(error, "معالجة البلاغ");
            sndToast.error({
                title: content.title,
                description: content.description,
                durationMs: 0,
            });
        },
    });

    if (reportsQuery.isPending) {
        return <AdminPageSkeleton />;
    }

    const filtered = Boolean(state.status || state.targetType || state.reason || state.sort !== "latest");
    const pageOutOfRange = Boolean(
        reportsQuery.data &&
            reportsQuery.data.data.length === 0 &&
            reportsQuery.data.meta.totalPages > 0 &&
            state.page > reportsQuery.data.meta.totalPages
    );

    return (
        <div className="grid gap-6" aria-busy={reportsQuery.isFetching}>
            <AdminPageHeader
                eyebrow="المراجعة والثقة"
                title="إدارة البلاغات"
                description="راجع المبلّغ والمحتوى والسياق قبل القرار. حالة البلاغ لا تخفي المحتوى تلقائيًا."
            />

            <form
                action="/admin/reports"
                method="get"
                onSubmit={(event) => {
                    event.preventDefault();
                    router.push(buildAdminFilterHrefFromForm("/admin/reports", event.currentTarget));
                }}
                className="grid gap-4 rounded-[1.75rem] border border-border bg-surface p-4 sm:grid-cols-2 xl:grid-cols-[11rem_11rem_minmax(12rem,1fr)_11rem_auto] xl:items-end"
            >
                <div className="grid gap-2">
                    <label htmlFor="admin-report-status" className="text-sm font-bold text-foreground">
                        الحالة
                    </label>
                    <select
                        id="admin-report-status"
                        name="status"
                        defaultValue={state.status ?? ""}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="">كل الحالات</option>
                        {reportStatuses.map((status) => (
                            <option key={status} value={status}>
                                {reportStatusLabels[status]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-report-target" className="text-sm font-bold text-foreground">
                        نوع المحتوى
                    </label>
                    <select
                        id="admin-report-target"
                        name="targetType"
                        defaultValue={state.targetType ?? ""}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="">الكل</option>
                        <option value="post">منشور</option>
                        <option value="comment">تعليق</option>
                    </select>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-report-reason" className="text-sm font-bold text-foreground">
                        سبب البلاغ
                    </label>
                    <select
                        id="admin-report-reason"
                        name="reason"
                        defaultValue={state.reason ?? ""}
                        className="h-11 rounded-xl border border-border bg-surface px-3 text-foreground"
                    >
                        <option value="">كل الأسباب</option>
                        {reportReasons.map((reason) => (
                            <option key={reason} value={reason}>
                                {reportReasonLabels[reason]}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-2">
                    <label htmlFor="admin-report-sort" className="text-sm font-bold text-foreground">
                        الترتيب
                    </label>
                    <select
                        id="admin-report-sort"
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
                            <Link href="/admin/reports">مسح</Link>
                        </Button>
                    ) : null}
                </div>
            </form>

            {reportsQuery.isError ? (
                <AdminErrorState
                    content={getAdminErrorContent(reportsQuery.error, "قائمة البلاغات")}
                    isRetrying={reportsQuery.isFetching}
                    onRetry={() => {
                        void reportsQuery.refetch();
                    }}
                />
            ) : reportsQuery.data.data.length === 0 ? (
                <AdminEmptyState
                    filtered={filtered || pageOutOfRange}
                    title={
                        pageOutOfRange
                            ? "هذه الصفحة لم تعد متاحة"
                            : filtered
                              ? "لا توجد بلاغات تطابق الفلاتر"
                              : "لا توجد بلاغات للمراجعة"
                    }
                    description={
                        pageOutOfRange
                            ? "ربما تغيّر عدد البلاغات بعد إغلاق عناصر من الطابور."
                            : filtered
                            ? "غيّر الحالة أو نوع المحتوى أو سبب البلاغ."
                            : "هذا أمر جيد؛ ستظهر البلاغات هنا عند إرسالها."
                    }
                    resetHref={
                        pageOutOfRange
                            ? buildAdminReportsHref({...state, page: reportsQuery.data.meta.totalPages})
                            : "/admin/reports"
                    }
                    actionLabel={pageOutOfRange ? "الانتقال إلى آخر صفحة متاحة" : "مسح الفلاتر"}
                />
            ) : (
                <section className="grid gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                        <p>
                            <strong className="text-foreground">{reportsQuery.data.meta.total}</strong> بلاغًا ضمن النتائج
                        </p>
                        <p aria-live="polite" className={reportsQuery.isFetching ? "opacity-100" : "opacity-0"}>
                            جار تحديث الطابور…
                        </p>
                    </div>

                    <ul
                        className={`grid gap-4 transition-opacity ${
                            reportsQuery.isPlaceholderData ? "opacity-60" : "opacity-100"
                        }`}
                    >
                        {reportsQuery.data.data.map((report) => (
                            <li key={report.id} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <AdminBadge tone={reportStatusTone(report.status)}>
                                                {reportStatusLabels[report.status]}
                                            </AdminBadge>
                                            <AdminBadge tone="muted">
                                                {report.targetType === "post" ? "منشور" : "تعليق"}
                                            </AdminBadge>
                                            <AdminBadge tone="brand">{reportReasonLabels[report.reason]}</AdminBadge>
                                        </div>

                                        <p dir="auto" className="mt-3 line-clamp-2 font-bold leading-7 text-foreground">
                                            {report.target ? getTargetSummary(report.target) : "المحتوى المستهدف لم يعد موجودًا"}
                                        </p>

                                        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                            <span className="inline-flex items-center gap-2">
                                                <Avatar
                                                    name={report.reporter.name}
                                                    imageUrl={report.reporter.avatar}
                                                    sizes="28px"
                                                    className="size-7 text-xs"
                                                />
                                                المبلّغ: {report.reporter.name}
                                            </span>
                                            <span>{formatAdminDate(report.createdAt)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        variant={report.status === "pending" ? "primary" : "secondary"}
                                        onClick={() => {
                                            setSelectedReportId(report.id);
                                            setReviewAction(null);
                                        }}
                                    >
                                        <Eye aria-hidden="true" />
                                        {report.status === "pending" ? "مراجعة البلاغ" : "عرض القرار"}
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <AdminPagination
                        meta={reportsQuery.data.meta}
                        buildHref={(page) => buildAdminReportsHref({...state, page})}
                    />
                </section>
            )}

            <ModalDialog
                open={Boolean(selectedReportId)}
                title="تفاصيل البلاغ"
                description="راجع السياق كاملًا قبل تسجيل القرار."
                onOpenChange={(open) => {
                    if (!open && !statusMutation.isPending) {
                        setSelectedReportId(null);
                        setReviewAction(null);
                    }
                }}
            >
                {detailQuery.isPending ? (
                    <AdminDetailSkeleton />
                ) : detailQuery.isError ? (
                    <AdminErrorState
                        content={getAdminErrorContent(detailQuery.error, "تفاصيل البلاغ")}
                        isRetrying={detailQuery.isFetching}
                        onRetry={() => {
                            void detailQuery.refetch();
                        }}
                    />
                ) : (
                    <div className="grid gap-5">
                        <div className="flex flex-wrap items-center gap-2">
                            <AdminBadge tone={reportStatusTone(detailQuery.data.status)}>
                                {reportStatusLabels[detailQuery.data.status]}
                            </AdminBadge>
                            <AdminBadge tone="brand">{reportReasonLabels[detailQuery.data.reason]}</AdminBadge>
                            <AdminBadge tone="muted">
                                {detailQuery.data.targetType === "post" ? "منشور" : "تعليق"}
                            </AdminBadge>
                        </div>

                        <section className="rounded-2xl border border-border bg-surface p-4">
                            <h3 className="text-xs font-bold text-muted-foreground">المبلّغ</h3>
                            <div className="mt-3 flex items-center gap-3">
                                <Avatar
                                    name={detailQuery.data.reporter.name}
                                    imageUrl={detailQuery.data.reporter.avatar}
                                    sizes="44px"
                                />
                                <div>
                                    <p className="font-bold text-foreground">{detailQuery.data.reporter.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        أرسل البلاغ في {formatAdminDate(detailQuery.data.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-border bg-surface-muted/45 p-4">
                            <h3 className="flex items-center gap-2 text-sm font-black text-foreground">
                                {detailQuery.data.targetType === "post" ? (
                                    <FileText aria-hidden="true" className="size-5 text-brand" />
                                ) : (
                                    <MessageSquare aria-hidden="true" className="size-5 text-brand" />
                                )}
                                المحتوى المبلّغ عنه
                            </h3>

                            {detailQuery.data.target ? (
                                <div className="mt-4 grid gap-4">
                                    {detailQuery.data.target.type === "post" ? (
                                        <h4 dir="auto" className="text-xl font-black text-foreground">
                                            {detailQuery.data.target.title}
                                        </h4>
                                    ) : null}
                                    <p dir="auto" className="whitespace-pre-wrap leading-8 text-foreground">
                                        {detailQuery.data.target.content}
                                    </p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <UserRound aria-hidden="true" className="size-4" />
                                        صاحب المحتوى: {detailQuery.data.target.author.name}
                                    </div>
                                    {detailQuery.data.target.type === "post" ? (
                                        <Button asChild variant="secondary" size="sm" className="w-fit">
                                            <Link
                                                href={`/admin/posts?q=${encodeURIComponent(
                                                    detailQuery.data.target.title
                                                )}`}
                                            >
                                                فتحه في إدارة المنشورات
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="mt-4 rounded-xl border border-dashed border-border-strong p-4">
                                    <p className="font-semibold text-foreground">المحتوى المستهدف لم يعد موجودًا</p>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                        يبقى سجل البلاغ قابلًا للمراجعة دون اختراع محتوى بديل.
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="rounded-2xl border border-border bg-surface p-4">
                            <h3 className="text-sm font-black text-foreground">تفاصيل المبلّغ</h3>
                            <p className="mt-2 whitespace-pre-wrap leading-7 text-muted-foreground">
                                {detailQuery.data.details || "لم يضف المبلّغ تفاصيل إضافية."}
                            </p>
                        </section>

                        {detailQuery.data.status === "pending" ? (
                            <section className="rounded-2xl border border-brand/20 bg-brand/5 p-4">
                                <h3 className="font-black text-foreground">تسجيل قرار المراجعة</h3>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    القرار نهائي في العقد الحالي؛ لا يمكن نقل البلاغ من حالة تمت مراجعتها إلى حالة أخرى.
                                </p>
                                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            setReviewAction({
                                                reportId: detailQuery.data.id,
                                                status: "reviewed",
                                            })
                                        }
                                    >
                                        تمت المراجعة
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={() =>
                                            setReviewAction({
                                                reportId: detailQuery.data.id,
                                                status: "dismissed",
                                            })
                                        }
                                    >
                                        رفض البلاغ
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setReviewAction({
                                                reportId: detailQuery.data.id,
                                                status: "actioned",
                                            })
                                        }
                                    >
                                        تم اتخاذ إجراء
                                    </Button>
                                </div>
                            </section>
                        ) : (
                            <section className="rounded-2xl border border-success/20 bg-success/8 p-4">
                                <h3 className="font-black text-foreground">سجل القرار</h3>
                                <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-xs text-muted-foreground">نفّذه</dt>
                                        <dd className="font-semibold text-foreground">
                                            {detailQuery.data.reviewedBy?.name ?? "مشرف غير متاح"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-muted-foreground">وقت القرار</dt>
                                        <dd className="font-semibold text-foreground">
                                            {detailQuery.data.reviewedAt
                                                ? formatAdminDate(detailQuery.data.reviewedAt)
                                                : "—"}
                                        </dd>
                                    </div>
                                </dl>
                                {detailQuery.data.adminNote ? (
                                    <p className="mt-4 whitespace-pre-wrap border-t border-success/15 pt-4 leading-7 text-foreground">
                                        {detailQuery.data.adminNote}
                                    </p>
                                ) : null}
                            </section>
                        )}
                    </div>
                )}
            </ModalDialog>

            {reviewAction ? (
                <AdminActionDialog
                    open
                    title={`تأكيد: ${reportStatusLabels[reviewAction.status]}`}
                    description={
                        reviewAction.status === "actioned"
                            ? "هذا يسجّل أن إجراءً اتُخذ، لكنه لا يخفي المنشور أو يوقف المستخدم تلقائيًا. نفّذ أي Moderation لازمة من قسمها المخصص."
                            : "سيُغلق البلاغ من حالة الانتظار، ولا يدعم العقد الحالي تغيير القرار بعد حفظه."
                    }
                    inputLabel="ملاحظة المشرف"
                    inputPlaceholder="أضف سياق القرار إن لزم"
                    confirmLabel="حفظ القرار"
                    pendingLabel="جار حفظ القرار"
                    optional
                    maxLength={1000}
                    danger={reviewAction.status === "dismissed"}
                    isPending={statusMutation.isPending}
                    serverError={
                        statusMutation.isError
                            ? getAdminErrorContent(statusMutation.error, "معالجة البلاغ").description
                            : null
                    }
                    onConfirm={(adminNote) => {
                        statusMutation.mutate({
                            reportId: reviewAction.reportId,
                            status: reviewAction.status,
                            ...(adminNote ? {adminNote} : {}),
                        });
                    }}
                    onOpenChange={(open) => {
                        if (!open && !statusMutation.isPending) {
                            statusMutation.reset();
                            setReviewAction(null);
                        }
                    }}
                />
            ) : null}
        </div>
    );
}
