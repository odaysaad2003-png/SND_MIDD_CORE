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

import {ProfileSettingsPanel} from "./profile-settings-panel";

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
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
            <ProfileSettingsPanel profile={profile} />
        </div>
    );
}
