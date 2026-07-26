import {ApiError} from "@/lib/api/api-error";

export type AuthOperation = "login" | "register";

export type AuthFieldName = "name" | "email" | "password";

export type AuthErrorTone = "danger" | "warning" | "info";

export type AuthErrorPresentation = Readonly<{
    title: string;
    description: string;
    formMessage: string;
    fieldErrors: Partial<Record<AuthFieldName, string>>;
    tone: AuthErrorTone;
    retryable: boolean;
    toastDurationMs: number;
    requestId: string | null;
}>;

type ValidationDetail = Readonly<{
    path: string;
}>;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readValidationDetails(details: unknown): readonly ValidationDetail[] {
    if (!Array.isArray(details)) {
        return [];
    }

    return details.flatMap((detail) => {
        if (!isRecord(detail) || typeof detail.path !== "string") {
            return [];
        }

        return [{path: detail.path}];
    });
}

function normalizeFieldPath(path: string): AuthFieldName | null {
    const normalizedPath = path.replace(/^body\./, "").trim();

    if (normalizedPath === "name" || normalizedPath === "email" || normalizedPath === "password") {
        return normalizedPath;
    }

    return null;
}

function getValidationFieldMessage(field: AuthFieldName, operation: AuthOperation): string {
    switch (field) {
        case "name":
            return "الاسم يجب أن يحتوي على حرفين على الأقل وألا يتجاوز 100 حرف.";

        case "email":
            return "أدخل بريدًا إلكترونيًا صحيحًا.";

        case "password":
            return operation === "register"
                ? "كلمة المرور يجب أن تحتوي على 8 إلى 72 حرفًا."
                : "أدخل كلمة المرور للمتابعة.";
    }
}

function mapValidationFieldErrors(details: unknown, operation: AuthOperation): Partial<Record<AuthFieldName, string>> {
    const fieldErrors: Partial<Record<AuthFieldName, string>> = {};

    for (const detail of readValidationDetails(details)) {
        const field = normalizeFieldPath(detail.path);

        if (!field || fieldErrors[field]) {
            continue;
        }

        fieldErrors[field] = getValidationFieldMessage(field, operation);
    }

    return fieldErrors;
}

function isBrowserOffline(): boolean {
    return typeof navigator !== "undefined" && navigator.onLine === false;
}

function createPresentation(
    options: Omit<AuthErrorPresentation, "fieldErrors" | "requestId"> & {
        fieldErrors?: Partial<Record<AuthFieldName, string>>;
        requestId?: string | null;
    }
): AuthErrorPresentation {
    return {
        ...options,
        fieldErrors: options.fieldErrors ?? {},
        requestId: options.requestId ?? null,
    };
}

export function isAuthAbortError(error: unknown): boolean {
    return error instanceof Error && error.name === "AbortError";
}

export function mapAuthMutationError(error: unknown, operation: AuthOperation): AuthErrorPresentation {
    if (!(error instanceof ApiError)) {
        return createPresentation({
            title: "حدث خطأ غير متوقع",
            description: "لم نتمكن من إكمال العملية. حاول مرة أخرى.",
            formMessage: "تعذر إكمال العملية بسبب خطأ غير متوقع.",
            tone: "danger",
            retryable: true,
            toastDurationMs: 7000,
        });
    }

    if (error.kind === "network") {
        if (isBrowserOffline()) {
            return createPresentation({
                title: "أنت غير متصل بالإنترنت",
                description: "احتفظنا بالبيانات التي أدخلتها. تحقق من الاتصال ثم أعد المحاولة.",
                formMessage: "لا يوجد اتصال بالإنترنت حاليًا. لن تفقد البيانات التي أدخلتها.",
                tone: "warning",
                retryable: true,
                toastDurationMs: 0,
            });
        }

        return createPresentation({
            title: "تعذر الوصول إلى سند",
            description: "لم يكتمل الاتصال بالخادم. بيانات النموذج ما زالت محفوظة.",
            formMessage: "تعذر الاتصال بالخادم. حاول مجددًا بعد لحظات.",
            tone: "warning",
            retryable: true,
            toastDurationMs: 0,
        });
    }

    if (error.kind === "invalid-response") {
        return createPresentation({
            title: "وصل رد غير متوقع",
            description: "لم نتمكن من التحقق من رد الخادم بصورة آمنة.",
            formMessage: "تعذر التحقق من استجابة الخادم. حاول مرة أخرى.",
            tone: "danger",
            retryable: true,
            toastDurationMs: 7000,
            requestId: error.requestId,
        });
    }

    if (error.code === "VALIDATION_ERROR" || error.status === 400) {
        const fieldErrors = mapValidationFieldErrors(error.details, operation);

        return createPresentation({
            title: "راجع البيانات المدخلة",
            description: "توجد بيانات لا تطابق المتطلبات. صحح الحقول الموضحة.",
            formMessage: "صحح الحقول الموضحة ثم أرسل النموذج مجددًا.",
            fieldErrors,
            tone: "warning",
            retryable: false,
            toastDurationMs: 6000,
            requestId: error.requestId,
        });
    }

    if (operation === "login" && (error.code === "UNAUTHORIZED" || error.status === 401)) {
        return createPresentation({
            title: "بيانات الدخول غير صحيحة",
            description: "راجع البريد الإلكتروني وكلمة المرور ثم حاول مرة أخرى.",
            formMessage: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
            tone: "danger",
            retryable: false,
            toastDurationMs: 6500,
            requestId: error.requestId,
        });
    }

    if (operation === "register" && (error.code === "CONFLICT" || error.status === 409)) {
        return createPresentation({
            title: "البريد مستخدم بالفعل",
            description: "يوجد حساب مرتبط بهذا البريد الإلكتروني. يمكنك الانتقال إلى تسجيل الدخول.",
            formMessage: "يوجد حساب مرتبط بهذا البريد الإلكتروني بالفعل.",
            fieldErrors: {
                email: "هذا البريد الإلكتروني مستخدم في حساب موجود.",
            },
            tone: "warning",
            retryable: false,
            toastDurationMs: 7000,
            requestId: error.requestId,
        });
    }

    if (error.code === "FORBIDDEN" || error.status === 403) {
        return createPresentation({
            title: "الحساب غير متاح",
            description: "لا يمكن استخدام هذا الحساب حاليًا.",
            formMessage: "هذا الحساب غير متاح لتسجيل الدخول حاليًا.",
            tone: "danger",
            retryable: false,
            toastDurationMs: 8000,
            requestId: error.requestId,
        });
    }

    if (error.code === "TOO_MANY_REQUESTS" || error.status === 429) {
        return createPresentation({
            title: "محاولات كثيرة خلال وقت قصير",
            description: "انتظر قليلًا قبل إرسال طلب جديد.",
            formMessage: "تم تقييد المحاولات مؤقتًا. حاول لاحقًا.",
            tone: "warning",
            retryable: false,
            toastDurationMs: 8000,
            requestId: error.requestId,
        });
    }

    if (error.code === "SERVICE_UNAVAILABLE" || error.status === 503) {
        return createPresentation({
            title: "الخدمة غير متاحة مؤقتًا",
            description: "الخادم لا يستطيع استقبال الطلب الآن. حاول مجددًا بعد لحظات.",
            formMessage: "خدمة تسجيل الحسابات غير متاحة مؤقتًا.",
            tone: "warning",
            retryable: true,
            toastDurationMs: 0,
            requestId: error.requestId,
        });
    }

    return createPresentation({
        title: "تعذر إكمال العملية",
        description: "حدث خطأ في الخادم. بيانات النموذج ما زالت محفوظة.",
        formMessage: "تعذر إكمال العملية حاليًا. حاول مرة أخرى.",
        tone: "danger",
        retryable: true,
        toastDurationMs: 7000,
        requestId: error.requestId,
    });
}
