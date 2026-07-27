import {ApiError} from "@/lib/api/api-error";

export type PostComposerErrorPresentation = Readonly<{
    title: string;
    description: string;
    tone: "danger" | "warning";
    requestId: string | null;
    ambiguousCreate?: boolean;
}>;

function requestIdFrom(error: ApiError): string | null {
    return error.requestId;
}

export function mapCreatePostError(error: unknown): PostComposerErrorPresentation {
    if (!(error instanceof ApiError)) {
        return {
            title: "تعذر نشر المنشور",
            description: "حدث خطأ غير متوقع. بقي النص محفوظًا داخل النافذة.",
            tone: "danger",
            requestId: null,
        };
    }

    if (error.kind === "network") {
        return {
            title: "انقطع الاتصال أثناء النشر",
            description:
                "بقي النص محفوظًا، لكن لا يمكننا الجزم هل وصل طلب الإنشاء إلى الخادم. تجنب النقر المتكرر قبل التحقق من منشوراتك لتفادي نسخة مكررة.",
            tone: "warning",
            requestId: null,
            ambiguousCreate: true,
        };
    }

    if (error.kind === "invalid-response") {
        return {
            title: "وصل رد غير قابل للتحقق",
            description:
                "لم نعتبر العملية ناجحة لأن الرد لا يطابق العقد المعتمد. بقي النص محفوظًا، وقد تحتاج إلى التحقق من منشوراتك قبل الإعادة.",
            tone: "warning",
            requestId: requestIdFrom(error),
            ambiguousCreate: true,
        };
    }

    if (error.status === 401) {
        return {
            title: "انتهت جلسة الدخول",
            description: "سجّل الدخول مجددًا ثم أعد فتح أداة النشر. لم نحذف النص من النموذج الحالي.",
            tone: "warning",
            requestId: requestIdFrom(error),
        };
    }

    if (error.status === 403) {
        return {
            title: "النشر غير متاح لهذا الحساب",
            description: "رفض الخادم تنفيذ العملية. قد يكون الحساب غير نشط أو لا يملك الصلاحية المطلوبة.",
            tone: "danger",
            requestId: requestIdFrom(error),
        };
    }

    if (error.status === 429) {
        return {
            title: "محاولات كثيرة خلال وقت قصير",
            description: "انتظر قليلًا قبل إعادة المحاولة. بقي محتوى المنشور محفوظًا.",
            tone: "warning",
            requestId: requestIdFrom(error),
        };
    }

    if (error.status === 400 || error.status === 422) {
        return {
            title: "راجع بيانات المنشور",
            description: "رفض الخادم بعض البيانات. راجع العنوان والمحتوى ثم حاول مرة أخرى.",
            tone: "danger",
            requestId: requestIdFrom(error),
        };
    }

    return {
        title: "تعذر نشر المنشور",
        description: "الخدمة غير متاحة حاليًا. بقي النص محفوظًا ويمكنك المحاولة لاحقًا.",
        tone: "danger",
        requestId: requestIdFrom(error),
    };
}

export function mapPostImageUploadError(error: unknown): PostComposerErrorPresentation {
    if (!(error instanceof ApiError)) {
        return {
            title: "نُشر النص وتعذر رفع الصور",
            description: "المنشور موجود بالفعل بدون صور. يمكنك إعادة رفع الصور أو المتابعة بدونهـا.",
            tone: "warning",
            requestId: null,
        };
    }

    if (error.kind === "network") {
        return {
            title: "نُشر النص وانقطع رفع الصور",
            description:
                "المنشور موجود بالفعل. حافظنا على الصور المختارة لإعادة المحاولة دون إنشاء منشور جديد.",
            tone: "warning",
            requestId: null,
        };
    }

    if (error.status === 413 || error.code === "PAYLOAD_TOO_LARGE") {
        return {
            title: "نُشر النص وإحدى الصور كبيرة",
            description: "الحد الأقصى لكل صورة هو 5 ميجابايت. احذف الصورة الكبيرة ثم أعد رفع الصور.",
            tone: "warning",
            requestId: requestIdFrom(error),
        };
    }

    if (error.status === 415 || error.code === "UNSUPPORTED_MEDIA_TYPE") {
        return {
            title: "نُشر النص ورفض الخادم صورة",
            description: "استخدم صور JPEG أو PNG أو WEBP أصلية يتطابق محتواها مع نوع الملف.",
            tone: "warning",
            requestId: requestIdFrom(error),
        };
    }

    if (error.status === 401 || error.status === 403) {
        return {
            title: "نُشر النص وتوقف رفع الصور",
            description: "لم يعد رفع الصور مسموحًا لهذه الجلسة. المنشور النصي ما زال محفوظًا.",
            tone: "warning",
            requestId: requestIdFrom(error),
        };
    }

    if (error.status === 429) {
        return {
            title: "نُشر النص وتم إيقاف الرفع مؤقتًا",
            description: "انتظر قليلًا ثم أعد محاولة رفع الصور نفسها، دون إعادة إنشاء المنشور.",
            tone: "warning",
            requestId: requestIdFrom(error),
        };
    }

    return {
        title: "نُشر النص وتعذر رفع الصور",
        description: "المنشور موجود بدون صور. يمكنك إعادة المحاولة أو المتابعة بدونهـا.",
        tone: "warning",
        requestId: requestIdFrom(error),
    };
}
