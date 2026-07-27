"use client";

import {LoaderCircle, Send} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {Field} from "@/components/ui/field";
import {Textarea} from "@/components/ui/textarea";
import {resolveAuthDestination} from "@/features/auth/navigation/resolve-auth-destination";
import {useAuth} from "@/features/auth/providers/auth-provider";
import {useOnlineStatus} from "@/features/posts/hooks/use-online-status";

import {mapCommentError, type CommentErrorPresentation} from "../errors/comment-error-mapper";
import {useCreateCommentMutation} from "../hooks/use-comment-mutations";
import {commentContentSchema} from "../schemas/public-comments.schema";

export function CommentComposer({postId}: Readonly<{postId: string}>) {
    const {status} = useAuth();
    const isOnline = useOnlineStatus();
    const mutation = useCreateCommentMutation(postId);
    const [content, setContent] = useState("");
    const [fieldError, setFieldError] = useState<string | null>(null);
    const [requestError, setRequestError] = useState<CommentErrorPresentation | null>(null);
    const remaining = 1000 - content.length;

    async function submit(): Promise<void> {
        setFieldError(null);
        setRequestError(null);

        if (status === "anonymous") {
            const returnTo = `${window.location.pathname}${window.location.search}#comments`;
            window.location.assign(`/login?${new URLSearchParams({returnTo: resolveAuthDestination(returnTo)})}`);
            return;
        }
        if (status !== "authenticated" || mutation.isPending) return;
        if (!isOnline) {
            setRequestError({title: "لا يوجد اتصال بالإنترنت", description: "احتفظنا بمسودة تعليقك. أعد الإرسال بعد عودة الاتصال.", requestId: null});
            return;
        }

        const parsed = commentContentSchema.safeParse(content);
        if (!parsed.success) {
            setFieldError(parsed.error.issues[0]?.message ?? "تحقق من التعليق");
            return;
        }

        try {
            await mutation.mutateAsync({content: parsed.data});
            setContent("");
        } catch (error) {
            setRequestError(mapCommentError(error, "create"));
        }
    }

    return (
        <div className="grid gap-3 rounded-2xl border border-border bg-surface-raised p-4 sm:p-5">
            <Field htmlFor="new-comment" label="أضف تعليقك" error={fieldError ?? undefined}>
                <Textarea
                    id="new-comment"
                    value={content}
                    maxLength={1000}
                    disabled={mutation.isPending}
                    aria-invalid={Boolean(fieldError)}
                    aria-describedby="new-comment-counter"
                    placeholder={status === "anonymous" ? "سجّل الدخول للمشاركة في المحادثة" : "اكتب تعليقًا يحترم إرشادات المجتمع…"}
                    onChange={(event) => {
                        setContent(event.target.value);
                        if (fieldError) setFieldError(null);
                    }}
                    className="min-h-28"
                />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <span id="new-comment-counter" className={remaining < 50 ? "text-sm text-warning" : "text-sm text-muted-foreground"}>
                    متبقٍ {remaining.toLocaleString("ar-PS")} حرف
                </span>
                <Button type="button" disabled={mutation.isPending || status === "checking"} aria-busy={mutation.isPending} onClick={() => void submit()}>
                    {mutation.isPending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <Send aria-hidden="true" />}
                    {mutation.isPending ? "جار النشر…" : status === "anonymous" ? "سجّل الدخول للتعليق" : "نشر التعليق"}
                </Button>
            </div>
            {requestError ? (
                <Feedback variant="danger" title={requestError.title} description={
                    <span>{requestError.description}{requestError.requestId ? <> معرّف الطلب: <code dir="ltr">{requestError.requestId}</code></> : null}</span>
                } />
            ) : null}
        </div>
    );
}
