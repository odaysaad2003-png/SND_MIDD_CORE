"use client";

import {AnimatePresence, motion, useReducedMotion} from "motion/react";
import {CircleCheck, CircleX, Info, LoaderCircle, TriangleAlert, X, type LucideIcon} from "lucide-react";
import {useEffect, useState, useSyncExternalStore, type ReactNode} from "react";
import {createPortal} from "react-dom";

import {cn} from "@/lib/utils/cn";

import {sndToast, sndToastStore, type SndToastItem, type SndToastVariant} from "./snd-toast-store";

type SndToastProviderProps = Readonly<{
    children: ReactNode;
}>;

type ToastVisual = Readonly<{
    icon: LucideIcon;
    iconClassName: string;
    glowClassName: string;
    progressClassName: string;
    surfaceClassName: string;
}>;

const toastVisuals: Record<SndToastVariant, ToastVisual> = {
    loading: {
        icon: LoaderCircle,
        iconClassName: "text-brand",
        glowClassName: "bg-brand/18",
        progressClassName: "bg-[linear-gradient(90deg,var(--hero-deep),var(--brand),var(--hero-warm))]",
        surfaceClassName: "border-brand/25",
    },

    success: {
        icon: CircleCheck,
        iconClassName: "text-success",
        glowClassName: "bg-success/18",
        progressClassName: "bg-success",
        surfaceClassName: "border-success/25",
    },

    error: {
        icon: CircleX,
        iconClassName: "text-danger",
        glowClassName: "bg-danger/18",
        progressClassName: "bg-danger",
        surfaceClassName: "border-danger/30",
    },

    warning: {
        icon: TriangleAlert,
        iconClassName: "text-warning",
        glowClassName: "bg-warning/18",
        progressClassName: "bg-warning",
        surfaceClassName: "border-warning/30",
    },

    info: {
        icon: Info,
        iconClassName: "text-info",
        glowClassName: "bg-info/18",
        progressClassName: "bg-info",
        surfaceClassName: "border-info/25",
    },
};

type ToastCardProps = Readonly<{
    toast: SndToastItem;
}>;

function ToastCard({toast}: ToastCardProps) {
    const reduceMotion = useReducedMotion();

    const visual = toastVisuals[toast.variant];
    const Icon = visual.icon;

    const isLoading = toast.variant === "loading";

    const role = toast.variant === "error" ? "alert" : "status";

    function handleAction(): void {
        toast.action?.onClick();

        if (toast.action?.dismissOnClick !== false) {
            sndToast.dismiss(toast.id);
        }
    }

    return (
        <motion.li
            layout="position"
            role={role}
            aria-atomic="true"
            initial={
                reduceMotion
                    ? false
                    : {
                          opacity: 0,
                          x: 28,
                          y: -10,
                          scale: 0.94,
                      }
            }
            animate={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: 1,
            }}
            exit={
                reduceMotion
                    ? {
                          opacity: 0,
                      }
                    : {
                          opacity: 0,
                          x: 24,
                          scale: 0.94,
                          filter: "blur(5px)",
                      }
            }
            transition={{
                duration: 0.38,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
                "pointer-events-auto relative isolate overflow-hidden",
                "rounded-[1.35rem] border bg-surface/94",
                "shadow-[0_24px_70px_rgba(5,31,55,0.18)]",
                "backdrop-blur-2xl",
                visual.surfaceClassName
            )}
        >
            <div
                aria-hidden="true"
                className={cn(
                    "pointer-events-none absolute -end-16 -top-20 -z-10 size-40 rounded-full blur-3xl",
                    visual.glowClassName
                )}
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent opacity-80"
            />

            <div className="flex items-start gap-3.5 p-4 pe-3">
                <div className="relative mt-0.5 shrink-0">
                    <motion.span
                        aria-hidden="true"
                        className={cn("absolute inset-0 rounded-2xl blur-md", visual.glowClassName)}
                        animate={
                            reduceMotion || !isLoading
                                ? undefined
                                : {
                                      scale: [0.9, 1.22, 0.9],
                                      opacity: [0.45, 0.85, 0.45],
                                  }
                        }
                        transition={{
                            duration: 1.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    <span
                        className={cn(
                            "relative grid size-11 place-items-center rounded-2xl",
                            "border border-current/10 bg-surface-raised/85",
                            visual.iconClassName
                        )}
                    >
                        <Icon aria-hidden="true" className={cn("size-5", isLoading && "animate-spin")} />
                    </span>
                </div>

                <div className="min-w-0 flex-1 py-0.5">
                    <p className="text-sm font-bold leading-6 text-foreground">{toast.title}</p>

                    {toast.description ? (
                        <p className="mt-0.5 text-sm leading-6 text-muted-foreground">{toast.description}</p>
                    ) : null}

                    {toast.action ? (
                        <button
                            type="button"
                            onClick={handleAction}
                            className={cn(
                                "mt-2.5 inline-flex min-h-9 items-center rounded-lg px-3",
                                "text-sm font-bold text-brand",
                                "transition-colors",
                                "hover:bg-brand/8"
                            )}
                        >
                            {toast.action.label}
                        </button>
                    ) : null}
                </div>

                {toast.dismissible ? (
                    <button
                        type="button"
                        aria-label="إغلاق الإشعار"
                        onClick={() => {
                            sndToast.dismiss(toast.id);
                        }}
                        className={cn(
                            "grid size-9 shrink-0 place-items-center rounded-xl",
                            "text-muted-foreground transition-colors",
                            "hover:bg-surface-muted hover:text-foreground"
                        )}
                    >
                        <X aria-hidden="true" className="size-4" />
                    </button>
                ) : null}
            </div>

            {isLoading ? (
                <div aria-hidden="true" className="relative h-1 overflow-hidden bg-border/55">
                    <motion.span
                        className={cn("absolute inset-y-0 w-1/3 rounded-full", visual.progressClassName)}
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      x: ["-120%", "330%"],
                                  }
                        }
                        transition={{
                            duration: 1.25,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />
                </div>
            ) : toast.durationMs > 0 ? (
                <div aria-hidden="true" className="h-1 overflow-hidden bg-border/45">
                    <motion.span
                        key={`${toast.id}-${toast.version}`}
                        className={cn("block h-full origin-right", visual.progressClassName)}
                        initial={{
                            scaleX: 1,
                        }}
                        animate={{
                            scaleX: 0,
                        }}
                        transition={{
                            duration: toast.durationMs / 1000,
                            ease: "linear",
                        }}
                    />
                </div>
            ) : null}
        </motion.li>
    );
}

function ToastViewport() {
    const toasts = useSyncExternalStore(
        sndToastStore.subscribe,
        sndToastStore.getSnapshot,
        sndToastStore.getServerSnapshot
    );

    return (
        <section
            aria-label="إشعارات سند"
            className={cn(
                "pointer-events-none fixed inset-x-3 top-3 z-[120]",
                "sm:inset-x-auto sm:start-5 sm:w-[min(26rem,calc(100vw-2.5rem))]"
            )}
        >
            <ol className="grid gap-3">
                <AnimatePresence initial={false} mode="popLayout">
                    {toasts.map((toast) => (
                        <ToastCard key={toast.id} toast={toast} />
                    ))}
                </AnimatePresence>
            </ol>
        </section>
    );
}

export function SndToastProvider({children}: SndToastProviderProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    return (
        <>
            {children}

            {isMounted ? createPortal(<ToastViewport />, document.body) : null}
        </>
    );
}
