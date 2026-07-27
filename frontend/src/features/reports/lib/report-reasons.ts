import type {ReportReason} from "../schemas/report.schema";

export const reportReasonLabels: Record<ReportReason, string> = {
    spam: "محتوى مزعج أو متكرر",
    harassment: "مضايقة أو تنمّر",
    hate_speech: "خطاب كراهية",
    violence: "عنف أو تهديد",
    scam: "احتيال أو خداع",
    sexual_content: "محتوى جنسي",
    misinformation: "معلومات مضللة",
    other: "سبب آخر",
};
