"use client";

import {useQuery} from "@tanstack/react-query";
import {CalendarDays, Clock, Mail, RefreshCw, ShieldCheck, UserRound} from "lucide-react";

import {Avatar} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Feedback} from "@/components/ui/feedback";
import {ApiError} from "@/lib/api/api-error";

import {myProfileQueryOptions} from "../queries/my-profile.query";
import type {MyProfile} from "../schemas/my-profile.schema";

const profileDateFormatter = new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "long",
    timeZone: "Asia/Gaza",
});

const roleLabels: Record<MyProfile["role"], string> = {
    user: "مستخدم",
    admin: "مدير",
};

type ProfileErrorContent = Readonly<{
    description: string;
    title: string;
}>;

function getProfileErrorContent(error: unknown): ProfileErrorContent {
    if (!(error instanceof ApiError)) {
        return {
            title: "تعذر تحميل الملف الشخصي",
            description: "حدث خطأ غير متوقع أثناء تجهيز بيانات حسابك. أعد المحاولة.",
        };
    }

    if (error.kind === "network") {
        return {
            title: "الاتصال بالحساب غير متاح الآن",
            description: "تعذر الوصول إلى الخادم. لم نسجّل خروجك، ويمكنك إعادة المحاولة بعد التحقق من الاتصال.",
        };
    }

    if (error.kind === "invalid-response") {
        return {
            title: "تعذر التحقق من بيانات الحساب",
            description: "وصل رد لا يطابق عقد البيانات المعتمد، لذلك لم نعرض بيانات قد تكون غير صحيحة.",
        };
    }

    if (error.status === 403) {
        return {
            title: "لا يمكن الوصول إلى هذا الحساب",
            description: "رفض الخادم تنفيذ الطلب. قد يكون الحساب غير نشط أو لا يملك الصلاحية المطلوبة.",
        };
    }

    if (error.status === 404) {
        return {
            title: "تعذر العثور على الملف الشخصي",
            description: "لم يعثر الخادم على بيانات الحساب الحالي.",
        };
    }

    return {
        title: "تعذر تحميل الملف الشخصي",
        description: "لم نتمكن من جلب بيانات حسابك حاليًا. أعد المحاولة، واستخدم معرّف الطلب عند التواصل مع الدعم.",
    };
}

function MyProfileSkeleton() {
    return (
        <div role="status" aria-label="جار تحميل بيانات الملف الشخصي" className="grid gap-5">
            <div
                aria-hidden="true"
                className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_18px_60px_rgba(11,40,68,0.08)]"
            >
                <div className="grid gap-6 border-b border-border p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
                    <div className="skeleton-block size-24 rounded-full" />

                    <div className="grid gap-3">
                        <div className="skeleton-block h-5 w-28 rounded-full" />
                        <div className="skeleton-block h-8 w-56 max-w-full rounded-full" />
                        <div className="skeleton-block h-4 w-72 max-w-full rounded-full" />
                    </div>
                </div>

                <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                    {Array.from({length: 4}, (_, index) => (
                        <div
                            key={`profile-detail-skeleton-${index}`}
                            className="grid gap-3 rounded-2xl border border-border bg-surface-muted/45 p-5"
                        >
                            <div className="skeleton-block h-4 w-28 rounded-full" />
                            <div className="skeleton-block h-5 w-44 max-w-full rounded-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function MyProfileClient() {
    const result = useQuery(myProfileQueryOptions());

    if (result.isPending) {
        return <MyProfileSkeleton />;
    }

    if (result.isError) {
        const errorContent = getProfileErrorContent(result.error);

        const requestId = result.error instanceof ApiError ? result.error.requestId : null;

        return (
            <Feedback
                variant="danger"
                title={errorContent.title}
                description={
                    <div className="grid gap-4">
                        <p>{errorContent.description}</p>

                        {requestId ? (
                            <p className="text-xs text-muted-foreground">
                                معرّف الطلب: <code dir="ltr">{requestId}</code>
                            </p>
                        ) : null}

                        <div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                aria-busy={result.isFetching}
                                onClick={() => {
                                    void result.refetch();
                                }}
                            >
                                <RefreshCw
                                    aria-hidden="true"
                                    className={result.isFetching ? "motion-safe:animate-spin" : undefined}
                                />

                                {result.isFetching ? "نعيد التحقق…" : "إعادة المحاولة"}
                            </Button>
                        </div>
                    </div>
                }
            />
        );
    }

    const profile = result.data;

    return (
        <div className="grid gap-5">
            <div aria-live="polite" className="min-h-6 text-sm text-muted-foreground">
                {result.isFetching ? (
                    <p className="inline-flex items-center gap-2">
                        <RefreshCw aria-hidden="true" className="size-4 text-brand motion-safe:animate-spin" />
                        نحدّث بيانات الحساب في الخلفية…
                    </p>
                ) : null}
            </div>

            <Card className="overflow-hidden rounded-[1.75rem]">
                <CardHeader className="relative gap-6 overflow-hidden border-b border-border p-6 sm:p-8">
                    <div
                        aria-hidden="true"
                        className="absolute -end-16 -top-20 size-56 rounded-full bg-brand/10 blur-3xl"
                    />

                    <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                            <Avatar
                                imageUrl={profile.avatar}
                                name={profile.name}
                                sizes="96px"
                                className="size-24 border-2 border-brand/20 text-2xl shadow-lg"
                            />

                            <div className="min-w-0 grid gap-2">
                                <p className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-brand/8 px-3 py-1 text-xs font-semibold text-brand">
                                    <UserRound aria-hidden="true" className="size-3.5" />
                                    الهوية الحالية
                                </p>

                                <h2 className="break-words text-2xl font-bold text-foreground sm:text-3xl">
                                    {profile.name}
                                </h2>

                                <p dir="ltr" className="break-all text-start text-sm text-muted-foreground">
                                    {profile.email}
                                </p>
                            </div>
                        </div>

                        <span
                            className={
                                profile.isActive
                                    ? "inline-flex w-fit items-center gap-2 rounded-full border border-success/25 bg-success/10 px-3 py-2 text-sm font-semibold text-success"
                                    : "inline-flex w-fit items-center gap-2 rounded-full border border-danger/25 bg-danger/10 px-3 py-2 text-sm font-semibold text-danger"
                            }
                        >
                            <ShieldCheck aria-hidden="true" className="size-4" />

                            {profile.isActive ? "الحساب نشط" : "الحساب غير نشط"}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="p-6 sm:p-8">
                    <dl className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2 rounded-2xl border border-border bg-surface-muted/45 p-5">
                            <dt className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <Mail aria-hidden="true" className="size-4 text-brand" />
                                البريد الإلكتروني
                            </dt>

                            <dd dir="ltr" className="break-all text-start font-semibold text-foreground">
                                {profile.email}
                            </dd>
                        </div>

                        <div className="grid gap-2 rounded-2xl border border-border bg-surface-muted/45 p-5">
                            <dt className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <ShieldCheck aria-hidden="true" className="size-4 text-brand" />
                                دور الحساب
                            </dt>

                            <dd className="font-semibold text-foreground">{roleLabels[profile.role]}</dd>
                        </div>

                        <div className="grid gap-2 rounded-2xl border border-border bg-surface-muted/45 p-5">
                            <dt className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <CalendarDays aria-hidden="true" className="size-4 text-brand" />
                                تاريخ إنشاء الحساب
                            </dt>

                            <dd className="font-semibold text-foreground">
                                <time dateTime={profile.createdAt}>
                                    {profileDateFormatter.format(new Date(profile.createdAt))}
                                </time>
                            </dd>
                        </div>

                        <div className="grid gap-2 rounded-2xl border border-border bg-surface-muted/45 p-5">
                            <dt className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                                <Clock aria-hidden="true" className="size-4 text-brand" />
                                آخر تحديث للملف
                            </dt>

                            <dd className="font-semibold text-foreground">
                                <time dateTime={profile.updatedAt}>
                                    {profileDateFormatter.format(new Date(profile.updatedAt))}
                                </time>
                            </dd>
                        </div>
                    </dl>
                </CardContent>
            </Card>

            <Feedback
                variant="info"
                title="بيانات خاصة بحسابك"
                description={
                    <p>
                        البريد الإلكتروني وحالة الحساب والدور لا تُعرض ضمن المنشورات أو التعليقات العامة. الاسم والصورة
                        فقط قد يظهران بجانب المحتوى الذي تنشره.
                    </p>
                }
            />
        </div>
    );
}
