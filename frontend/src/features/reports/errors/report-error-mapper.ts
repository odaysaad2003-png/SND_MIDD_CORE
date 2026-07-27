import {ApiError} from "@/lib/api/api-error";

export function mapReportError(error: unknown): {title: string; description: string; requestId: string | null} {
    const requestId = error instanceof ApiError ? error.requestId : null;
    if (!(error instanceof ApiError)) return {title: "تعذر إرسال البلاغ", description: "حدث خطأ غير متوقع. أعد المحاولة.", requestId};
    if (error.kind === "network") return {title: "تعذر الوصول إلى الخادم", description: "لم نؤكد استلام البلاغ. تحقق من الاتصال ثم أعد المحاولة.", requestId};
    if (error.kind === "invalid-response") return {title: "تعذر التحقق من استلام البلاغ", description: "وصل رد غير متوقع، لذلك لا نؤكد نجاح العملية.", requestId};
    if (error.status === 409) return {title: "سبق الإبلاغ عن هذا المحتوى", description: "لا تحتاج إلى إرسال بلاغ آخر عن المحتوى نفسه.", requestId};
    if (error.status === 403) return {title: "لا يمكن إرسال هذا البلاغ", description: "لا يمكن الإبلاغ عن محتواك، أو أن حالة الحساب لا تسمح بالعملية.", requestId};
    if (error.status === 404) return {title: "المحتوى غير متاح", description: "قد يكون المحتوى أزيل أو لم يعد متاحًا للعامة.", requestId};
    if (error.status === 429) return {title: "طلبات كثيرة", description: "انتظر قليلًا قبل إعادة المحاولة.", requestId};
    return {title: "تعذر إرسال البلاغ", description: "لم يعتمد الخادم البلاغ. أعد المحاولة لاحقًا.", requestId};
}
