import {ApiError} from "@/lib/api/api-error";

export type CommentErrorPresentation = Readonly<{
    title: string;
    description: string;
    requestId: string | null;
}>;

export function mapCommentError(error: unknown, action: "create" | "update" | "delete"): CommentErrorPresentation {
    const fallback = action === "create" ? "نشر التعليق" : action === "update" ? "تعديل التعليق" : "حذف التعليق";
    const requestId = error instanceof ApiError ? error.requestId : null;

    if (!(error instanceof ApiError)) {
        return {title: `تعذر ${fallback}`, description: "حدث خطأ غير متوقع. أعد المحاولة.", requestId};
    }
    if (error.kind === "network") {
        return {title: "تعذر الوصول إلى الخادم", description: "لم نؤكد التغيير. تحقق من الاتصال ثم أعد المحاولة.", requestId};
    }
    if (error.kind === "invalid-response") {
        return {title: "تعذر التحقق من النتيجة", description: "وصل رد غير متوقع؛ أعدنا مزامنة التعليقات مع الخادم.", requestId};
    }
    if (error.status === 403) {
        return {title: "العملية غير مسموحة", description: "لا تملك صلاحية تعديل هذا التعليق، أو أن حالة الحساب تغيّرت.", requestId};
    }
    if (error.status === 404) {
        return {title: "المحتوى غير متاح", description: "قد يكون التعليق أو المنشور أزيل. حدّث المحادثة لمعرفة حالتها الحالية.", requestId};
    }
    if (error.status === 429) {
        return {title: "طلبات كثيرة", description: "انتظر قليلًا قبل إعادة المحاولة.", requestId};
    }

    return {title: `تعذر ${fallback}`, description: "لم يعتمد الخادم التغيير. أعد المحاولة لاحقًا.", requestId};
}
