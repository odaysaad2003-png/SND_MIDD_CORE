"use client";

import {motion, useReducedMotion} from "motion/react";
import {ArrowLeft, ShieldCheck, Sparkles} from "lucide-react";
import Link from "next/link";
import {useId, type ReactNode} from "react";

import {cn} from "@/lib/utils/cn";

type AuthAlternativeAction = Readonly<{
    href: string;
    label: string;
    prompt: string;
}>;

type AuthFormCardProps = Readonly<{
    alternativeAction: AuthAlternativeAction;
    children: ReactNode;
    className?: string;
    description: string;
    eyebrow: string;
    title: string;
}>;

export function AuthFormCard({alternativeAction, children, className, description, eyebrow, title}: AuthFormCardProps) {
    const titleId = useId();
    const reduceMotion = useReducedMotion();

    return (
        <motion.section
            aria-labelledby={titleId}
            initial={
                reduceMotion
                    ? false
                    : {
                          opacity: 0,
                          scale: 0.985,
                          y: 18,
                      }
            }
            animate={{
                opacity: 1,
                scale: 1,
                y: 0,
            }}
            transition={{
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
            }}
            className={cn(
                "relative isolate overflow-hidden rounded-[1.85rem]",
                "border border-border/80 bg-surface/94",
                "shadow-[0_28px_90px_rgba(11,40,68,0.13)]",
                "backdrop-blur-xl",
                className
            )}
        >
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand/65 to-transparent"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-24 -top-28 -z-10 size-56 rounded-full bg-brand/9 blur-3xl"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-32 -start-20 -z-10 size-52 rounded-full bg-accent/8 blur-3xl"
            />

            <div className="relative px-5 pb-7 pt-6 sm:px-8 sm:pb-8 sm:pt-8">
                <header className="grid gap-5">
                    <div className="flex items-center justify-between gap-4">
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/15 bg-brand/7 px-3 py-2 text-xs font-bold text-brand">
                            <Sparkles aria-hidden="true" className="size-3.5" />

                            {eyebrow}
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                            <ShieldCheck aria-hidden="true" className="size-4 text-success" />
                            جلسة خاصة
                        </span>
                    </div>

                    <div className="grid gap-3">
                        <h1
                            id={titleId}
                            className="text-balance text-2xl font-bold leading-[1.45] tracking-[-0.025em] text-foreground sm:text-3xl"
                        >
                            {title}
                        </h1>

                        <p className="max-w-[44ch] text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                            {description}
                        </p>
                    </div>
                </header>

                <div className="mt-7">{children}</div>
            </div>

            <footer className="relative border-t border-border/75 bg-surface-muted/45 px-5 py-5 sm:px-8">
                <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm">
                    <span className="text-muted-foreground">{alternativeAction.prompt}</span>

                    <Link
                        href={alternativeAction.href}
                        className={cn(
                            "group inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2",
                            "font-bold text-brand transition-colors",
                            "hover:bg-brand/7 hover:text-brand/85"
                        )}
                    >
                        {alternativeAction.label}

                        <ArrowLeft
                            aria-hidden="true"
                            className="size-4 transition-transform duration-200 group-hover:-translate-x-1"
                        />
                    </Link>
                </div>
            </footer>
        </motion.section>
    );
}
