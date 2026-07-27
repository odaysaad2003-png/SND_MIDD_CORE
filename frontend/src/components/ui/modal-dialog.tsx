"use client";

import {X} from "lucide-react";
import {useEffect, useId, useRef, type MouseEvent, type ReactNode} from "react";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

type ModalDialogProps = Readonly<{
    open: boolean;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    className?: string;
    bodyClassName?: string;
    isBusy?: boolean;
    closeLabel?: string;
    onOpenChange: (open: boolean) => void;
}>;

export function ModalDialog({
    open,
    title,
    description,
    children,
    footer,
    className,
    bodyClassName,
    isBusy = false,
    closeLabel = "إغلاق النافذة",
    onOpenChange,
}: ModalDialogProps) {
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
        if (isBusy) {
            return;
        }

        onOpenChange(false);
    }

    function handleBackdropClick(event: MouseEvent<HTMLDialogElement>): void {
        if (event.target === event.currentTarget) {
            requestClose();
        }
    }

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            aria-busy={isBusy}
            onCancel={(event) => {
                event.preventDefault();
                requestClose();
            }}
            onClose={() => {
                if (open && !isBusy) {
                    onOpenChange(false);
                }
            }}
            onClick={handleBackdropClick}
            className={cn(
                "fixed inset-0 m-0 h-dvh w-full max-w-none overflow-hidden bg-transparent p-0 sm:m-auto sm:h-auto sm:w-[min(46rem,calc(100%-2rem))]",
                "backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm",
                className
            )}
        >
            <div className="flex h-full max-h-dvh flex-col overflow-hidden bg-surface-raised shadow-2xl sm:max-h-[min(92dvh,56rem)] sm:rounded-[2rem] sm:border sm:border-border">
                <header className="flex shrink-0 items-start gap-4 border-b border-border px-4 py-4 sm:px-6 sm:py-5">
                    <div className="min-w-0 flex-1">
                        <h2 id={titleId} className="text-xl font-black text-foreground sm:text-2xl">
                            {title}
                        </h2>

                        {description ? (
                            <p id={descriptionId} className="mt-1 text-sm leading-6 text-muted-foreground">
                                {description}
                            </p>
                        ) : null}
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={isBusy}
                        aria-label={closeLabel}
                        onClick={requestClose}
                        className="shrink-0 rounded-full"
                    >
                        <X aria-hidden="true" />
                    </Button>
                </header>

                <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6", bodyClassName)}>
                    {children}
                </div>

                {footer ? (
                    <footer className="shrink-0 border-t border-border bg-surface-muted/55 p-4 sm:px-6">
                        {footer}
                    </footer>
                ) : null}
            </div>
        </dialog>
    );
}
