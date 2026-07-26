"use client";

import {motion} from "motion/react";
import {CircleAlert, Info, RotateCcw, TriangleAlert, type LucideIcon} from "lucide-react";

import {cn} from "@/lib/utils/cn";

import type {AuthErrorTone} from "../errors/auth-error-mapper";

type AuthFormAlertProps = Readonly<{
    message: string;
    title?: string;
    tone?: AuthErrorTone;
    requestId?: string | null;
    actionLabel?: string;
    onAction?: () => void;
    actionDisabled?: boolean;
}>;

type AlertVisual = Readonly<{
    icon: LucideIcon;
    containerClassName: string;
    iconClassName: string;
}>;

const alertVisuals: Record<AuthErrorTone, AlertVisual> = {
    danger: {
        icon: CircleAlert,
        containerClassName: "border-danger/25 bg-danger/[0.055]",
        iconClassName: "bg-danger/10 text-danger",
    },

    warning: {
        icon: TriangleAlert,
        containerClassName: "border-warning/30 bg-warning/[0.065]",
        iconClassName: "bg-warning/12 text-warning",
    },

    info: {
        icon: Info,
        containerClassName: "border-info/25 bg-info/[0.055]",
        iconClassName: "bg-info/10 text-info",
    },
};

export function AuthFormAlert({
    message,
    title,
    tone = "danger",
    requestId,
    actionLabel,
    onAction,
    actionDisabled = false,
}: AuthFormAlertProps) {
    const visual = alertVisuals[tone];
    const Icon = visual.icon;

    return (
        <motion.div
            role={tone === "danger" ? "alert" : "status"}
            aria-atomic="true"
            initial={{
                opacity: 0,
                height: 0,
                y: -6,
            }}
            animate={{
                opacity: 1,
                height: "auto",
                y: 0,
            }}
            exit={{
                opacity: 0,
                height: 0,
                y: -6,
            }}
            transition={{
                duration: 0.24,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn("overflow-hidden rounded-2xl border", visual.containerClassName)}
        >
            <div className="flex items-start gap-3 p-4">
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", visual.iconClassName)}>
                    <Icon aria-hidden="true" className="size-[1.125rem]" />
                </span>

                <div className="min-w-0 flex-1">
                    {title ? <p className="text-sm font-bold leading-6 text-foreground">{title}</p> : null}

                    <p className="text-sm leading-6 text-muted-foreground">{message}</p>

                    {requestId ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                            رقم مرجع الطلب:{" "}
                            <code
                                dir="ltr"
                                className="rounded-md bg-surface/70 px-1.5 py-0.5 font-mono text-[0.7rem] text-foreground"
                            >
                                {requestId}
                            </code>
                        </p>
                    ) : null}

                    {actionLabel && onAction ? (
                        <button
                            type="button"
                            disabled={actionDisabled}
                            onClick={onAction}
                            className={cn(
                                "mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg px-3",
                                "text-sm font-bold text-brand",
                                "transition-colors",
                                "hover:bg-brand/8",
                                "disabled:pointer-events-none disabled:opacity-50"
                            )}
                        >
                            <RotateCcw aria-hidden="true" className="size-4" />

                            {actionLabel}
                        </button>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
}
