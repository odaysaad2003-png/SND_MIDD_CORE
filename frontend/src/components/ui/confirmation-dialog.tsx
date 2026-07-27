"use client";

import {AlertTriangle, LoaderCircle} from "lucide-react";
import {useEffect, useId, useRef, type MouseEvent, type ReactNode} from "react";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

type ConfirmationDialogProps = Readonly<{
    open: boolean;

    title: string;
    description: ReactNode;

    confirmLabel: string;
    pendingLabel?: string;
    cancelLabel?: string;

    variant?: "primary" | "danger";
    isPending?: boolean;

    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}>;

export function ConfirmationDialog({
    open,
    title,
    description,
    confirmLabel,
    pendingLabel = "جار التنفيذ",
    cancelLabel = "إلغاء",
    variant = "danger",
    isPending = false,
    onConfirm,
    onOpenChange,
}: ConfirmationDialogProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (open && !dialog.open) {
            dialog.showModal();
            return;
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        return () => {
            const dialog = dialogRef.current;

            if (dialog?.open) {
                dialog.close();
            }
        };
    }, []);

    function requestClose(): void {
        if (isPending) {
            return;
        }

        onOpenChange(false);
    }

    function handleBackdropClick(event: MouseEvent<HTMLDialogElement>): void {
        if (event.target !== event.currentTarget) {
            return;
        }

        requestClose();
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={(event) => {
                event.preventDefault();
                requestClose();
            }}
            onClose={() => {
                if (open && !isPending) {
                    onOpenChange(false);
                }
            }}
            onClick={handleBackdropClick}
            className={cn(
                "fixed inset-0 m-auto w-[min(30rem,calc(100%-2rem))] max-w-none overflow-visible bg-transparent p-0",
                "backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm"
            )}
        >
            <div className="overflow-hidden rounded-3xl border border-border bg-surface-raised shadow-2xl">
                <div className="flex items-start gap-4 p-5 sm:p-6">
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-danger/10 text-danger">
                        <AlertTriangle aria-hidden="true" className="size-6" />
                    </span>

                    <div className="min-w-0 flex-1">
                        <h2 id={titleId} className="text-lg font-bold text-foreground">
                            {title}
                        </h2>

                        <div id={descriptionId} className="mt-2 text-sm leading-7 text-muted-foreground">
                            {description}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border bg-surface-muted/60 p-4 sm:flex-row sm:justify-end">
                    <Button
                        autoFocus
                        type="button"
                        variant="secondary"
                        disabled={isPending}
                        onClick={requestClose}
                        className="w-full sm:w-auto"
                    >
                        {cancelLabel}
                    </Button>

                    <Button
                        type="button"
                        variant={variant}
                        disabled={isPending}
                        aria-busy={isPending}
                        onClick={onConfirm}
                        className="w-full sm:w-auto"
                    >
                        {isPending ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : null}

                        {isPending ? pendingLabel : confirmLabel}
                    </Button>
                </div>
            </div>
        </dialog>
    );
}
