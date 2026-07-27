import {ApiError} from "@/lib/api/api-error";

export type AvatarUploadErrorTone = "danger" | "warning" | "info";

export type AvatarUploadErrorPresentation = Readonly<{
    title: string;
    description: string;
    fileMessage?: string;
    tone: AvatarUploadErrorTone;
    retryable: boolean;
    toastDurationMs: number;
    requestId: string | null;
}>;

type CreateAvatarUploadErrorOptions = Omit<AvatarUploadErrorPresentation, "requestId"> &
    Readonly<{
        requestId?: string | null;
    }>;

function createAvatarUploadError(options: CreateAvatarUploadErrorOptions): AvatarUploadErrorPresentation {
    return {
        ...options,
        requestId: options.requestId ?? null,
    };
}

function isBrowserOffline(): boolean {
    return typeof navigator !== "undefined" && navigator.onLine === false;
}

export function isAvatarUploadAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
}

export function mapAvatarUploadError(error: unknown): AvatarUploadErrorPresentation {
    if (!(error instanceof ApiError)) {
        return createAvatarUploadError({
            title: "حدث خطأ غير متوقع",
            description: "لم نتمكن من رفع الصورة. حاول مرة أخرى.",
            tone: "danger",
            retryable: true,
            toastDurationMs: 7000,
        });
    }

    if (error.kind === "network") {
        if (isBrowserOffline()) {
            return createAvatarUploadError({
                title: "أنت غير متصل بالإنترنت",
                description: "احتفظنا بالصورة المختارة. تحقق من الاتصال ثم أعد المحاولة.",
                tone: "warning",
                retryable: true,
                toastDurationMs: 0,
            });
        }

        return createAvatarUploadError({
            title: "تعذر الوصول إلى سند",
            description: "لم يكتمل الاتصال بالخادم. الصورة المختارة ما زالت محفوظة.",
            tone: "warning",
            retryable: true,
            toastDurationMs: 0,
        });
    }

    if (error.kind === "invalid-response") {
        return createAvatarUploadError({
            title: "وصل رد غير متوقع",
            description: "وصل الرد من الخادم، لكن لم نتمكن من التحقق منه بصورة آمنة.",
            tone: "danger",
            retryable: true,
            toastDurationMs: 7000,
            requestId: error.requestId,
        });
    }

    if (error.status === 400) {
        return createAvatarUploadError({
            title: "لم يستقبل الخادم الصورة",
            description: "تأكد من اختيار صورة واحدة بصيغة مدعومة ثم حاول مجددًا.",
            fileMessage: "تعذر قراءة الملف المختار. اختر صورة أخرى.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 6500,
            requestId: error.requestId,
        });
    }

    if (error.status === 401) {
        return createAvatarUploadError({
            title: "انتهت جلسة الدخول",
            description: "لم يعد بإمكاننا تنفيذ طلبات خاصة بهذا الحساب.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 6500,
            requestId: error.requestId,
        });
    }

    if (error.status === 403) {
        return createAvatarUploadError({
            title: "لا يمكن تعديل هذا الحساب",
            description: "الحساب غير متاح لتنفيذ هذه العملية حاليًا.",
            tone: "danger",
            retryable: false,
            toastDurationMs: 8000,
            requestId: error.requestId,
        });
    }

    if (error.status === 413) {
        return createAvatarUploadError({
            title: "حجم الصورة كبير",
            description: "الخادم رفض الصورة لأنها تتجاوز الحد المسموح.",
            fileMessage: "اختر صورة لا يتجاوز حجمها 5 ميجابايت.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 6500,
            requestId: error.requestId,
        });
    }

    if (error.status === 415) {
        return createAvatarUploadError({
            title: "محتوى الصورة غير مدعوم",
            description: "امتداد الملف أو محتواه الداخلي لا يطابق صيغ الصور المسموحة.",
            fileMessage: "اختر صورة JPEG أو PNG أو WEBP حقيقية.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 7000,
            requestId: error.requestId,
        });
    }

    if (error.status === 429) {
        return createAvatarUploadError({
            title: "محاولات رفع كثيرة",
            description: "تم تقييد رفع الصور مؤقتًا. انتظر قليلًا ثم حاول مرة أخرى.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 8000,
            requestId: error.requestId,
        });
    }

    if (error.status === 503) {
        return createAvatarUploadError({
            title: "خدمة الصور غير متاحة",
            description: "تعذر الوصول إلى خدمة تخزين الصور. يمكنك إعادة المحاولة لاحقًا.",
            tone: "warning",
            retryable: true,
            toastDurationMs: 0,
            requestId: error.requestId,
        });
    }

    return createAvatarUploadError({
        title: "تعذر رفع الصورة",
        description: "حدث خطأ في الخادم. الصورة المختارة ما زالت محفوظة.",
        tone: "danger",
        retryable: true,
        toastDurationMs: 7000,
        requestId: error.requestId,
    });
}
