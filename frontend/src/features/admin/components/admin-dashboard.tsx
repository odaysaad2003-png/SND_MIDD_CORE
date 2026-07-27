"use client";

import {useQuery} from "@tanstack/react-query";
import {
    Activity,
    FileWarning,
    Flag,
    HeartHandshake,
    MessageSquare,
    RefreshCw,
    ShieldAlert,
    UserCheck,
    Users,
    type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";

import {formatAdminDate, getAdminErrorContent} from "../lib/admin-display";
import {adminDashboardQueryOptions} from "../queries/admin.queries";
import {AdminErrorState, AdminPageHeader, AdminPageSkeleton} from "./admin-ui";

type StatCardProps = Readonly<{
    label: string;
    value: number;
    supporting: string;
    href: string;
    icon: LucideIcon;
    tone?: "brand" | "danger" | "success" | "warning";
}>;

const toneStyles = {
    brand: "bg-brand/10 text-brand",
    danger: "bg-danger/10 text-danger",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-foreground",
} as const;

function StatCard({label, value, supporting, href, icon: Icon, tone = "brand"}: StatCardProps) {
    return (
        <Card className="group overflow-hidden transition-[transform,border-color,box-shadow] hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-lg">
            <CardHeader className="flex grid-cols-none flex-row items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-muted-foreground">{label}</p>
                    <p className="mt-2 text-4xl font-black tabular-nums text-foreground">{value.toLocaleString("ar-PS")}</p>
                </div>
                <span className={`grid size-12 place-items-center rounded-2xl ${toneStyles[tone]}`}>
                    <Icon aria-hidden="true" className="size-6" />
                </span>
            </CardHeader>
            <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{supporting}</p>
                <Link
                    href={href}
                    className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-brand underline-offset-4 hover:underline"
                >
                    فتح القسم
                </Link>
            </CardContent>
        </Card>
    );
}

export function AdminDashboard() {
    const result = useQuery(adminDashboardQueryOptions());

    if (result.isPending) {
        return <AdminPageSkeleton cards={8} />;
    }

    if (result.isError) {
        return (
            <div className="grid gap-6">
                <AdminPageHeader
                    eyebrow="مركز العمليات"
                    title="نظرة عامة"
                    description="ملخص تشغيلي آمن لحالة الحسابات والمحتوى والبلاغات."
                />
                <AdminErrorState
                    content={getAdminErrorContent(result.error, "ملخص لوحة الإدارة")}
                    isRetrying={result.isFetching}
                    onRetry={() => {
                        void result.refetch();
                    }}
                />
            </div>
        );
    }

    const summary = result.data;
    const processedReports =
        summary.reports.reviewed + summary.reports.dismissed + summary.reports.actioned;

    return (
        <div className="grid gap-6" aria-busy={result.isFetching}>
            <AdminPageHeader
                eyebrow="مركز العمليات"
                title="نظرة عامة"
                description="الأرقام التالية Snapshot تشغيلية مولّدة من الخادم وليست بيانات وهمية أو سجلًا ماليًا لحظيًا."
                actions={
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={result.isFetching}
                        aria-busy={result.isFetching}
                        onClick={() => {
                            void result.refetch();
                        }}
                    >
                        <RefreshCw
                            aria-hidden="true"
                            className={result.isFetching ? "motion-safe:animate-spin" : undefined}
                        />
                        {result.isFetching ? "جار التحديث" : "تحديث الملخص"}
                    </Button>
                }
            />

            <section aria-labelledby="admin-statistics-title" className="grid gap-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h3 id="admin-statistics-title" className="text-xl font-black text-foreground">
                            مؤشرات المنصة
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            آخر توليد: <time dateTime={summary.generatedAt}>{formatAdminDate(summary.generatedAt)}</time>
                        </p>
                    </div>
                    <p
                        aria-live="polite"
                        className={`inline-flex items-center gap-2 text-sm text-brand transition-opacity ${
                            result.isFetching ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <Activity aria-hidden="true" className="size-4" />
                        نحدّث الأرقام
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="إجمالي المستخدمين"
                        value={summary.users.total}
                        supporting={`${summary.users.byRole.admins} مشرف، و${summary.users.byRole.users} مستخدم`}
                        href="/admin/users"
                        icon={Users}
                    />
                    <StatCard
                        label="الحسابات النشطة"
                        value={summary.users.byStatus.active}
                        supporting={`${summary.users.byStatus.suspended} حساب موقوف حاليًا`}
                        href="/admin/users?status=active"
                        icon={UserCheck}
                        tone="success"
                    />
                    <StatCard
                        label="البلاغات المعلقة"
                        value={summary.reports.pending}
                        supporting={`${processedReports} بلاغًا خرج من طابور الانتظار`}
                        href="/admin/reports?status=pending"
                        icon={Flag}
                        tone={summary.reports.pending > 0 ? "warning" : "success"}
                    />
                    <StatCard
                        label="المنشورات المخفية"
                        value={summary.posts.adminHidden}
                        supporting={`${summary.posts.publicVisible} ظاهر، و${summary.posts.ownerDeleted} حذفه صاحبه`}
                        href="/admin/posts?moderationStatus=hidden"
                        icon={ShieldAlert}
                        tone={summary.posts.adminHidden > 0 ? "danger" : "success"}
                    />
                    <StatCard
                        label="إجمالي المنشورات"
                        value={summary.posts.total}
                        supporting="يشمل الظاهر والمخفي والمحذوف بواسطة صاحبه"
                        href="/admin/posts"
                        icon={FileWarning}
                    />
                    <StatCard
                        label="إجمالي البلاغات"
                        value={summary.reports.total}
                        supporting={`${summary.reports.actioned} باتخاذ إجراء، و${summary.reports.dismissed} مرفوض`}
                        href="/admin/reports"
                        icon={Flag}
                    />
                    <StatCard
                        label="التعليقات النشطة"
                        value={summary.comments.active}
                        supporting={`${summary.comments.deleted} تعليقًا محذوفًا من أصل ${summary.comments.total}`}
                        href="/posts"
                        icon={MessageSquare}
                    />
                    <StatCard
                        label="التفاعل النشط"
                        value={summary.engagement.activeLikes + summary.engagement.activeSaves}
                        supporting={`${summary.engagement.activeLikes} إعجاب و${summary.engagement.activeSaves} حفظ`}
                        href="/posts"
                        icon={HeartHandshake}
                    />
                </div>
            </section>
        </div>
    );
}
