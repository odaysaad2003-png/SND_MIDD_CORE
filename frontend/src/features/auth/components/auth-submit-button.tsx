"use client";

import {AnimatePresence, motion, useReducedMotion} from "motion/react";
import {ArrowLeft, CircleCheck, LoaderCircle} from "lucide-react";
import type {ComponentProps} from "react";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

type AuthSubmitButtonProps = Omit<ComponentProps<typeof Button>, "aria-busy" | "children" | "type"> &
    Readonly<{
        label: string;
        pending?: boolean;
        pendingLabel: string;
        success?: boolean;
        successLabel?: string;
    }>;

export function AuthSubmitButton({
    className,
    disabled,
    label,
    pending = false,
    pendingLabel,
    success = false,
    successLabel = "تم بنجاح",
    ...buttonProps
}: AuthSubmitButtonProps) {
    const reduceMotion = useReducedMotion();

    const state = success ? "success" : pending ? "pending" : "idle";

    return (
        <Button
            {...buttonProps}
            type="submit"
            size="lg"
            aria-busy={pending}
            disabled={disabled || pending || success}
            className={cn(
                "group relative isolate w-full overflow-hidden rounded-xl cursor-pointer",
                "bg-[linear-gradient(110deg,var(--hero-deep),var(--brand),var(--hero-warm))]",
                "bg-[length:180%_100%]",
                "text-brand-foreground",
                "shadow-[0_14px_34px_color-mix(in_oklch,var(--brand)_30%,transparent)]",
                "transition-[transform,background-position,box-shadow] duration-100",
                "hover:-translate-y-0.5 hover:bg-[position:100%_0]",
                "hover:shadow-[0_18px_42px_color-mix(in_oklch,var(--brand)_38%,transparent)]",
                "active:translate-y-0",
                success && "bg-success shadow-[0_14px_34px_color-mix(in_oklch,var(--success)_28%,transparent)]",
                className
            )}
        >
            {pending && !reduceMotion ? (
                <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -start-1/3 -z-10 w-1/3 skew-x-[-18deg] bg-white/18 blur-sm"
                    animate={{
                        x: ["-20%", "430%"],
                    }}
                    transition={{
                        duration: 2.25,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ) : null}

            <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-20 bg-black/0 transition-colors group-active:bg-black/8"
            />

            <span className="relative grid min-h-6 place-items-center">
                <AnimatePresence mode="wait" initial={false}>
                    {state === "pending" ? (
                        <motion.span
                            key="pending"
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          y: 7,
                                      }
                            }
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={
                                reduceMotion
                                    ? undefined
                                    : {
                                          opacity: 0,
                                          y: -7,
                                      }
                            }
                            className="inline-flex items-center justify-center gap-2"
                        >
                            <LoaderCircle aria-hidden="true" className="size-[1.155rem] animate-spin" />

                            {pendingLabel}
                        </motion.span>
                    ) : state === "success" ? (
                        <motion.span
                            key="success"
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          scale: 0.86,
                                      }
                            }
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={
                                reduceMotion
                                    ? undefined
                                    : {
                                          opacity: 0,
                                          scale: 0.9,
                                      }
                            }
                            className="inline-flex items-center justify-center gap-2"
                        >
                            <CircleCheck aria-hidden="true" className="size-[1.125rem]" />

                            {successLabel}
                        </motion.span>
                    ) : (
                        <motion.span
                            key="idle"
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          y: 7,
                                      }
                            }
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={
                                reduceMotion
                                    ? undefined
                                    : {
                                          opacity: 0,
                                          y: -7,
                                      }
                            }
                            className="inline-flex items-center justify-center gap-2"
                        >
                            {label}

                            <ArrowLeft
                                aria-hidden="true"
                                className="transition-transform duration-200 group-hover:-translate-x-1"
                            />
                        </motion.span>
                    )}
                </AnimatePresence>
            </span>
        </Button>
    );
}
