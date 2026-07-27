import {ApiError} from "@/lib/api/api-error";

export type ProfileUpdateErrorTone = "danger" | "warning" | "info";

export type ProfileUpdateErrorPresentation = Readonly<{
    title: string;
    description: string;
    fieldMessage?: string;
    tone: ProfileUpdateErrorTone;
    retryable: boolean;
    toastDurationMs: number;
    requestId: string | null;
}>;

type CreatePresentationOptions = Omit<ProfileUpdateErrorPresentation, "requestId"> &
    Readonly<{
        requestId?: string | null;
    }>;

function createPresentation(options: CreatePresentationOptions): ProfileUpdateErrorPresentation {
    return {
        ...options,
        requestId: options.requestId ?? null,
    };
}

function isBrowserOffline(): boolean {
    return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isProfileUpdateAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
}

export function mapProfileUpdateError(error: unknown): ProfileUpdateErrorPresentation {
    if (!(error instanceof ApiError)) {
        return createPresentation({
            title: "حدث خطأ غير متوقع",
            description: "لم نتمكن من حفظ التغييرات. حاول مرة أخرى.",
            tone: "danger",
            retryable: true,
            toastDurationMs: 7000,
        });
    }

    if (error.kind === "network") {
        if (isBrowserOffline()) {
            return createPresentation({
                title: "أنت غير متصل بالإنترنت",
                description: "احتفظنا بالاسم الذي أدخلته. تحقق من الاتصال ثم أعد المحاولة.",
                tone: "warning",
                retryable: true,
                toastDurationMs: 0,
            });
        }

        return createPresentation({
            title: "تعذر الوصول إلى سند",
            description: "لم يكتمل الاتصال بالخادم، ولم نفقد البيانات التي أدخلتها.",
            tone: "warning",
            retryable: true,
            toastDurationMs: 0,
        });
    }

    if (error.kind === "invalid-response") {
        return createPresentation({
            title: "وصل رد غير متوقع",
            description: "وصل الرد من الخادم، لكن لم نتمكن من التحقق منه بصورة آمنة.",
            tone: "danger",
            retryable: true,
            toastDurationMs: 7000,
            requestId: error.requestId,
        });
    }

    if (error.code === "VALIDATION_ERROR" || error.status === 400) {
        return createPresentation({
            title: "راجع الاسم المدخل",
            description: "الاسم لا يطابق متطلبات الملف الشخصي.",
            fieldMessage: "الاسم يجب أن يحتوي على حرفين على الأقل وألا يتجاوز 100 حرف.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 6000,
            requestId: error.requestId,
        });
    }

    if (error.status === 401) {
        return createPresentation({
            title: "انتهت جلسة الدخول",
            description: "سجّل الدخول مجددًا قبل تعديل الملف الشخصي.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 7000,
            requestId: error.requestId,
        });
    }

    if (error.status === 403) {
        return createPresentation({
            title: "الحساب غير متاح",
            description: "لا يمكن تعديل هذا الحساب حاليًا.",
            tone: "danger",
            retryable: false,
            toastDurationMs: 8000,
            requestId: error.requestId,
        });
    }

    if (error.status === 429) {
        return createPresentation({
            title: "طلبات كثيرة خلال وقت قصير",
            description: "انتظر قليلًا قبل محاولة حفظ الاسم مجددًا.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 8000,
            requestId: error.requestId,
        });
    }

    if (error.status === 503) {
        return createPresentation({
            title: "الخدمة غير متاحة مؤقتًا",
            description: "تعذر حفظ التغييرات الآن. يمكنك إعادة المحاولة.",
            tone: "warning",
            retryable: true,
            toastDurationMs: 0,
            requestId: error.requestId,
        });
    }

    return createPresentation({
        title: "تعذر حفظ التغييرات",
        description: "حدث خطأ في الخادم. الاسم الذي أدخلته ما زال محفوظًا.",
        tone: "danger",
        retryable: true,
        toastDurationMs: 7000,
        requestId: error.requestId,
    });
}
