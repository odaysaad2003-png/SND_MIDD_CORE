import {ApiError} from "@/lib/api/api-error";

export type PostInteractionErrorMessage = Readonly<{
    title: string;
    description: string;
}>;

export function mapPostInteractionError(error: unknown): PostInteractionErrorMessage {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
        return {
            title: "أنت غير متصل بالإنترنت",
            description: "أعد الاتصال ثم حاول مزامنة التفاعل مرة أخرى.",
        };
    }

    if (!(error instanceof ApiError)) {
        return {
            title: "تعذر إتمام التفاعل",
            description: "أعد المحاولة بعد لحظات.",
        };
    }

    if (error.kind === "network") {
        return {
            title: "تعذر الوصول إلى سند",
            description: "أعدنا الحالة السابقة لأن نتيجة الطلب غير مؤكدة.",
        };
    }

    if (error.kind === "invalid-response") {
        return {
            title: "تعذر تأكيد التفاعل",
            description: "وصل رد غير متوقع، لذلك سنعيد مزامنة الحالة.",
        };
    }

    switch (error.status) {
        case 401:
            return {title: "انتهت الجلسة", description: "سجّل الدخول ثم حاول مرة أخرى."};
        case 403:
            return {title: "التفاعل غير متاح", description: "لا يملك حسابك صلاحية تنفيذ هذا الإجراء."};
        case 404:
            return {title: "المنشور غير متاح", description: "ربما حُذف المنشور أو لم يعد متاحًا للعامة."};
        case 429:
            return {title: "محاولات كثيرة", description: "انتظر قليلًا قبل إعادة المحاولة."};
        case 503:
            return {title: "الخدمة غير متاحة مؤقتًا", description: "احتفظنا بالحالة السابقة. حاول لاحقًا."};
        default:
            return {title: "تعذر إتمام التفاعل", description: "أعد المحاولة بعد لحظات."};
    }
}
