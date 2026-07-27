import {ApiError} from "@/lib/api/api-error";

import type {ReportReason, ReportStatus} from "../schemas/admin.schema";

export const reportReasonLabels: Record<ReportReason, string> = {
    spam: "محتوى مزعج",
    harassment: "مضايقة",
    hate_speech: "خطاب كراهية",
    violence: "عنف",
    scam: "احتيال",
    sexual_content: "محتوى جنسي",
    misinformation: "معلومات مضللة",
    other: "سبب آخر",
};

export const reportStatusLabels: Record<ReportStatus, string> = {
    pending: "بانتظار المراجعة",
    reviewed: "تمت المراجعة",
    dismissed: "مرفوض",
    actioned: "تم اتخاذ إجراء",
};

export function formatAdminDate(value: string): string {
    return new Intl.DateTimeFormat("ar-PS", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export type AdminErrorContent = Readonly<{
    title: string;
    description: string;
    requestId: string | null;
    isForbidden: boolean;
    isNotFound: boolean;
}>;

export function getAdminErrorContent(error: unknown, resourceLabel: string): AdminErrorContent {
    if (!(error instanceof ApiError)) {
        return {
            title: `تعذر تحميل ${resourceLabel}`,
            description: "حدث خطأ غير متوقع. أعد المحاولة دون تنفيذ أي إجراء جديد.",
            requestId: null,
            isForbidden: false,
            isNotFound: false,
        };
    }

    if (error.kind === "network") {
        return {
            title: "الاتصال بالخادم غير متاح",
            description: `تعذر تحميل ${resourceLabel}. تحقق من الإنترنت ثم أعد المحاولة.`,
            requestId: error.requestId,
            isForbidden: false,
            isNotFound: false,
        };
    }

    if (error.kind === "invalid-response") {
        return {
            title: "تعذر التحقق من البيانات",
            description: "وصل رد لا يطابق العقد الموثق، لذلك لم نعرض بيانات إدارية غير موثوقة.",
            requestId: error.requestId,
            isForbidden: false,
            isNotFound: false,
        };
    }

    if (error.status === 403) {
        return {
            title: "الصلاحية الإدارية غير متاحة",
            description: "رفض الخادم الطلب بعد التحقق من حالة الحساب وصلاحيته الحالية.",
            requestId: error.requestId,
            isForbidden: true,
            isNotFound: false,
        };
    }

    if (error.status === 404) {
        return {
            title: "العنصر لم يعد متاحًا",
            description: "ربما حُذف العنصر أو تغيّر أثناء فتح هذه الصفحة. حدّث القائمة وحاول مجددًا.",
            requestId: error.requestId,
            isForbidden: false,
            isNotFound: true,
        };
    }

    if (error.status === 409) {
        return {
            title: "تغيّرت حالة العنصر",
            description: "نفّذ مشرف آخر الإجراء أو أن الحالة الحالية لا تسمح به. حدّث البيانات قبل المحاولة.",
            requestId: error.requestId,
            isForbidden: false,
            isNotFound: false,
        };
    }

    return {
        title: `تعذر تحميل ${resourceLabel}`,
        description: "لم يكتمل الطلب. أعد المحاولة واستخدم معرّف الطلب عند التواصل مع الدعم.",
        requestId: error.requestId,
        isForbidden: false,
        isNotFound: false,
    };
}
