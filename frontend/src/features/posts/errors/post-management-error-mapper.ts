import {ApiError} from "@/lib/api/api-error";

export type PostManagementOperation = "delete" | "edit" | "remove-image" | "upload-images";

export type PostManagementErrorPresentation = Readonly<{
    title: string;
    description: string;
    requestId: string | null;
    tone: "danger" | "warning";
}>;

const operationLabels: Record<PostManagementOperation, string> = {
    delete: "حذف المنشور",
    edit: "حفظ التعديلات",
    "remove-image": "حذف الصورة",
    "upload-images": "رفع الصور",
};

export function mapPostManagementError(
    error: unknown,
    operation: PostManagementOperation
): PostManagementErrorPresentation {
    const operationLabel = operationLabels[operation];

    if (!(error instanceof ApiError)) {
        return {
            title: `تعذر ${operationLabel}`,
            description: "حدث خطأ غير متوقع. لم نفقد البيانات الموجودة في الواجهة.",
            requestId: null,
            tone: "danger",
        };
    }

    if (error.kind === "network") {
        return {
            title: `انقطع الاتصال أثناء ${operationLabel}`,
            description:
                operation === "delete"
                    ? "لا يمكننا الجزم بنتيجة الحذف. حدّث قائمة منشوراتك قبل إعادة المحاولة لتجنب قرار متكرر."
                    : "احتفظنا بالمدخلات والاختيارات الحالية. تحقق من الاتصال ثم أعد المحاولة.",
            requestId: null,
            tone: "warning",
        };
    }

    if (error.kind === "invalid-response") {
        return {
            title: "وصل رد غير قابل للتحقق",
            description: "لم نحدّث الواجهة بنتيجة غير مؤكدة. أعد تحميل القائمة للتأكد من الحالة الفعلية على الخادم.",
            requestId: error.requestId,
            tone: "warning",
        };
    }

    if (error.status === 401) {
        return {
            title: "انتهت جلسة الدخول",
            description: "سجّل الدخول مجددًا قبل إدارة منشوراتك.",
            requestId: error.requestId,
            tone: "warning",
        };
    }

    if (error.status === 403) {
        return {
            title: "لا تملك صلاحية تنفيذ العملية",
            description: "الخادم لم يعتبر الحساب الحالي مالكًا لهذا المنشور أو أن الحساب غير نشط.",
            requestId: error.requestId,
            tone: "danger",
        };
    }

    if (error.status === 404) {
        return {
            title: "المنشور أو الصورة لم يعد متاحًا",
            description: "قد يكون المحتوى حُذف أو تغيّر من جلسة أخرى. أعد تحميل قائمة منشوراتك.",
            requestId: error.requestId,
            tone: "warning",
        };
    }

    if (error.status === 413 || error.code === "PAYLOAD_TOO_LARGE") {
        return {
            title: "إحدى الصور أكبر من المسموح",
            description: "الحد الأقصى لكل صورة هو 5 ميجابايت. احذف الصورة الكبيرة ثم أعد الرفع.",
            requestId: error.requestId,
            tone: "warning",
        };
    }

    if (error.status === 415 || error.code === "UNSUPPORTED_MEDIA_TYPE") {
        return {
            title: "رفض الخادم صيغة صورة",
            description: "استخدم JPEG أو PNG أو WEBP أصلية يتطابق محتواها مع نوع الملف.",
            requestId: error.requestId,
            tone: "warning",
        };
    }

    if (error.status === 429) {
        return {
            title: "محاولات كثيرة خلال وقت قصير",
            description: "انتظر قليلًا قبل إعادة المحاولة. لم نحذف اختياراتك الحالية.",
            requestId: error.requestId,
            tone: "warning",
        };
    }

    if (error.status === 400 || error.status === 422) {
        return {
            title: "راجع البيانات قبل المتابعة",
            description: "رفض الخادم المدخلات الحالية. راجع النص أو عدد الصور ثم حاول مجددًا.",
            requestId: error.requestId,
            tone: "danger",
        };
    }

    return {
        title: `تعذر ${operationLabel}`,
        description: "الخدمة غير متاحة حاليًا. أعد المحاولة لاحقًا واستخدم معرّف الطلب عند طلب الدعم.",
        requestId: error.requestId,
        tone: "danger",
    };
}
