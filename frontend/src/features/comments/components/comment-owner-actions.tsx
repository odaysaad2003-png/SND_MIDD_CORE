"use client";

import {LoaderCircle, Pencil, Trash2} from "lucide-react";
import {useState} from "react";

import {Button} from "@/components/ui/button";
import {ConfirmationDialog} from "@/components/ui/confirmation-dialog";
import {Feedback} from "@/components/ui/feedback";
import {Textarea} from "@/components/ui/textarea";

import {mapCommentError, type CommentErrorPresentation} from "../errors/comment-error-mapper";
import {useDeleteCommentMutation, useUpdateCommentMutation} from "../hooks/use-comment-mutations";
import {commentContentSchema, type PublicComment} from "../schemas/public-comments.schema";

export function CommentOwnerActions({comment}: Readonly<{comment: PublicComment}>) {
    const updateMutation = useUpdateCommentMutation();
    const deleteMutation = useDeleteCommentMutation();
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [content, setContent] = useState(comment.content);
    const [error, setError] = useState<CommentErrorPresentation | null>(null);
    const [fieldError, setFieldError] = useState<string | null>(null);

    async function save(): Promise<void> {
        const parsed = commentContentSchema.safeParse(content);
        if (!parsed.success) {
            setFieldError(parsed.error.issues[0]?.message ?? "تحقق من التعليق");
            return;
        }
        try {
            await updateMutation.mutateAsync({comment, input: {content: parsed.data}});
            setEditing(false);
            setError(null);
        } catch (caught) {
            setError(mapCommentError(caught, "update"));
        }
    }

    async function remove(): Promise<void> {
        try {
            await deleteMutation.mutateAsync(comment);
            setConfirmDelete(false);
        } catch (caught) {
            setConfirmDelete(false);
            setError(mapCommentError(caught, "delete"));
        }
    }

    return (
        <div className="grid gap-3">
            {editing ? (
                <div className="grid gap-2">
                    <Textarea value={content} maxLength={1000} disabled={updateMutation.isPending} aria-invalid={Boolean(fieldError)} onChange={(event) => {setContent(event.target.value); setFieldError(null);}} className="min-h-28" />
                    {fieldError ? <p className="text-sm text-danger">{fieldError}</p> : null}
                    <div className="flex flex-wrap justify-end gap-2">
                        <Button type="button" variant="ghost" disabled={updateMutation.isPending} onClick={() => {setEditing(false); setContent(comment.content);}}>إلغاء</Button>
                        <Button type="button" disabled={updateMutation.isPending} onClick={() => void save()}>
                            {updateMutation.isPending ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
                            حفظ التعديل
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-wrap justify-end gap-1">
                    <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(true)}><Pencil aria-hidden="true" /> تعديل</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}><Trash2 aria-hidden="true" /> حذف</Button>
                </div>
            )}
            {error ? <Feedback variant="danger" title={error.title} description={error.description} /> : null}
            <ConfirmationDialog open={confirmDelete} title="حذف التعليق؟" description="سيختفي التعليق من المحادثة بعد تأكيد الخادم، ولا يمكن استعادته من الواجهة." confirmLabel="حذف التعليق" pendingLabel="جار الحذف…" isPending={deleteMutation.isPending} onConfirm={() => void remove()} onOpenChange={setConfirmDelete} />
        </div>
    );
}
