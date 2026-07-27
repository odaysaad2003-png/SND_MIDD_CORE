"use client";

import {LoaderCircle} from "lucide-react";
import {useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {Field} from "@/components/ui/field";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {Textarea} from "@/components/ui/textarea";
import {resolveAuthDestination} from "@/features/auth/navigation/resolve-auth-destination";
import {useAuth} from "@/features/auth/providers/auth-provider";
import {useOnlineStatus} from "@/features/posts/hooks/use-online-status";

import {createReport} from "../api/report-api";
import {mapReportError} from "../errors/report-error-mapper";
import {reportReasonLabels} from "../lib/report-reasons";
import {reportInputSchema, reportReasons, type ReportReason, type ReportTarget} from "../schemas/report.schema";

export function ReportDialog({open, target, onOpenChange}: Readonly<{open: boolean; target: ReportTarget; onOpenChange: (open: boolean) => void}>) {
    const {status} = useAuth();
    const isOnline = useOnlineStatus();
    const [reason, setReason] = useState<ReportReason | "">("");
    const [details, setDetails] = useState("");
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<ReturnType<typeof mapReportError> | null>(null);

    async function submit(): Promise<void> {
        setError(null);
        if (status === "anonymous") {
            const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
            window.location.assign(`/login?${new URLSearchParams({returnTo: resolveAuthDestination(returnTo)})}`);
            return;
        }
        if (status !== "authenticated" || pending) return;
        if (!isOnline) {
            setError({title: "لا يوجد اتصال بالإنترنت", description: "لم نرسل البلاغ. أعد المحاولة بعد عودة الاتصال.", requestId: null});
            return;
        }
        const parsed = reportInputSchema.safeParse({reason, details: details.trim() || undefined});
        if (!parsed.success) {
            setError({title: "اختر سبب البلاغ", description: parsed.error.issues[0]?.message ?? "تحقق من بيانات البلاغ.", requestId: null});
            return;
        }
        setPending(true);
        try {
            await createReport(target, parsed.data);
            onOpenChange(false);
            setReason("");
            setDetails("");
            sndToast.success({title: "تم استلام البلاغ", description: "سيتم التعامل معه وفق سياسات المنصة."});
        } catch (caught) {
            setError(mapReportError(caught));
        } finally {
            setPending(false);
        }
    }

    return (
        <ModalDialog open={open} title="الإبلاغ عن محتوى" description="ساعدنا في الحفاظ على مجتمع آمن. لن نعدك بإزالة المحتوى قبل مراجعته." isBusy={pending} onOpenChange={onOpenChange}
            footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="secondary" disabled={pending} onClick={() => onOpenChange(false)}>إلغاء</Button><Button type="button" disabled={pending || status === "checking"} onClick={() => void submit()}>{pending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}{status === "anonymous" ? "سجّل الدخول للمتابعة" : "إرسال البلاغ"}</Button></div>}>
            <div className="grid gap-5">
                <fieldset className="grid gap-2">
                    <legend className="mb-2 text-sm font-semibold">سبب البلاغ</legend>
                    {reportReasons.map((value) => <label key={value} className="flex min-h-11 items-center gap-3 rounded-xl border border-border p-3"><input type="radio" name={`report-${target.type}-${target.id}`} value={value} checked={reason === value} disabled={pending} onChange={() => setReason(value)} /><span>{reportReasonLabels[value]}</span></label>)}
                </fieldset>
                <Field htmlFor={`report-details-${target.id}`} label="تفاصيل إضافية (اختياري)">
                    <Textarea id={`report-details-${target.id}`} value={details} maxLength={1000} disabled={pending} onChange={(event) => setDetails(event.target.value)} className="min-h-28" />
                </Field>
                <p className="text-sm text-muted-foreground">متبقٍ {(1000 - details.length).toLocaleString("ar-PS")} حرف</p>
                {error ? <Feedback variant="danger" title={error.title} description={error.description} /> : null}
            </div>
        </ModalDialog>
    );
}
