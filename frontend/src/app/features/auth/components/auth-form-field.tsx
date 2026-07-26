"use client";

import {AnimatePresence, motion, useReducedMotion} from "motion/react";
import {AlertTriangle, Eye, EyeOff, LockKeyhole, type LucideIcon} from "lucide-react";
import {useId, useState, type ComponentProps, type KeyboardEvent} from "react";

import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils/cn";

type AuthTextFieldProps = Omit<ComponentProps<"input">, "children" | "id"> &
    Readonly<{
        description?: string;
        error?: string;
        icon: LucideIcon;
        id?: string;
        label: string;
    }>;

type FieldMessageProps = Readonly<{
    description?: string;
    descriptionId: string;
    error?: string;
    errorId: string;
}>;

function FieldMessage({description, descriptionId, error, errorId}: FieldMessageProps) {
    const reduceMotion = useReducedMotion();

    return (
        <AnimatePresence mode="wait" initial={false}>
            {error ? (
                <motion.p
                    key="error"
                    id={errorId}
                    role="alert"
                    initial={
                        reduceMotion
                            ? false
                            : {
                                  opacity: 0,
                                  height: 0,
                                  y: -4,
                              }
                    }
                    animate={{
                        opacity: 1,
                        height: "auto",
                        y: 0,
                    }}
                    exit={
                        reduceMotion
                            ? undefined
                            : {
                                  opacity: 0,
                                  height: 0,
                                  y: -4,
                              }
                    }
                    transition={{
                        duration: reduceMotion ? 0 : 0.2,
                    }}
                    className="text-sm font-medium leading-6 text-danger"
                >
                    {error}
                </motion.p>
            ) : description ? (
                <motion.p
                    key="description"
                    id={descriptionId}
                    initial={reduceMotion ? false : {opacity: 0}}
                    animate={{
                        opacity: 1,
                    }}
                    exit={reduceMotion ? undefined : {opacity: 0}}
                    transition={{
                        duration: reduceMotion ? 0 : 0.2,
                    }}
                    className="text-sm leading-6 text-muted-foreground"
                >
                    {description}
                </motion.p>
            ) : null}
        </AnimatePresence>
    );
}

function buildDescribedBy({description, descriptionId, error, errorId}: FieldMessageProps): string | undefined {
    if (error) {
        return errorId;
    }

    if (description) {
        return descriptionId;
    }

    return undefined;
}

export function AuthTextField({
    className,
    description,
    dir,
    error,
    icon: Icon,
    id,
    label,
    required,
    type = "text",
    ...inputProps
}: AuthTextFieldProps) {
    const generatedId = useId();
    const resolvedId = id ?? generatedId;

    const descriptionId = `${resolvedId}-description`;
    const errorId = `${resolvedId}-error`;

    const describedBy = buildDescribedBy({
        description,
        descriptionId,
        error,
        errorId,
    });

    const isLeftToRight = dir === "ltr" || type === "email" || type === "url" || type === "tel";

    return (
        <div className="grid gap-2">
            <label htmlFor={resolvedId} className="flex items-center gap-1 text-sm font-semibold text-foreground">
                {label}

                {required ? (
                    <>
                        <span aria-hidden="true" className="text-danger">
                            *
                        </span>

                        <span className="sr-only">مطلوب</span>
                    </>
                ) : null}
            </label>

            <div className="group relative">
                <Icon
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute start-3.5 top-1/2 z-10 size-[1.125rem] -translate-y-1/2",
                        "text-muted-foreground transition-colors duration-200",
                        "group-focus-within:text-brand",
                        error && "text-danger"
                    )}
                />

                <Input
                    {...inputProps}
                    id={resolvedId}
                    type={type}
                    dir={isLeftToRight ? "ltr" : dir}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy}
                    className={cn(
                        "h-12 rounded-xl bg-surface-raised/72 ps-11 pe-4",
                        "transition-[border-color,background-color,box-shadow,transform]",
                        "focus:bg-surface",
                        "group-hover:bg-surface",
                        isLeftToRight && "text-left",
                        error && "border-danger bg-danger/[0.035]",
                        className
                    )}
                />

                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute inset-x-3 bottom-0 h-px",
                        "origin-center scale-x-0 bg-brand",
                        "transition-transform duration-300",
                        "group-focus-within:scale-x-100",
                        error && "scale-x-100 bg-danger"
                    )}
                />
            </div>

            <FieldMessage description={description} descriptionId={descriptionId} error={error} errorId={errorId} />
        </div>
    );
}

type AuthPasswordFieldProps = Omit<AuthTextFieldProps, "dir" | "icon" | "type">;

export function AuthPasswordField({
    className,
    description,
    error,
    id,
    label,
    onBlur,
    onKeyDown,
    onKeyUp,
    required,
    ...inputProps
}: AuthPasswordFieldProps) {
    const generatedId = useId();
    const reduceMotion = useReducedMotion();
    const resolvedId = id ?? generatedId;

    const descriptionId = `${resolvedId}-description`;
    const errorId = `${resolvedId}-error`;
    const capsLockId = `${resolvedId}-caps-lock`;

    const [isVisible, setIsVisible] = useState(false);
    const [isCapsLockOn, setIsCapsLockOn] = useState(false);

    const describedBy = [error ? errorId : description ? descriptionId : null, isCapsLockOn ? capsLockId : null]
    .filter(Boolean)
    .join(" ");

    function synchronizeCapsLock(event: KeyboardEvent<HTMLInputElement>) {
        setIsCapsLockOn(event.getModifierState("CapsLock"));
    }

    return (
        <div className="grid gap-2">
            <label htmlFor={resolvedId} className="flex items-center gap-1 text-sm font-semibold text-foreground">
                {label}

                {required ? (
                    <>
                        <span aria-hidden="true" className="text-danger">
                            *
                        </span>

                        <span className="sr-only">مطلوب</span>
                    </>
                ) : null}
            </label>

            <div className="group relative">
                <LockKeyhole
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute start-3.5 top-1/2 z-10 size-[1.125rem] -translate-y-1/2",
                        "text-muted-foreground transition-colors duration-200",
                        "group-focus-within:text-brand",
                        error && "text-danger"
                    )}
                />

                <Input
                    {...inputProps}
                    id={resolvedId}
                    type={isVisible ? "text" : "password"}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={describedBy || undefined}
                    className={cn(
                        "h-12 rounded-xl bg-surface-raised/72 ps-11 pe-12",
                        "transition-[border-color,background-color,box-shadow,transform]",
                        "focus:bg-surface",
                        "group-hover:bg-surface",
                        error && "border-danger bg-danger/[0.035]",
                        className
                    )}
                    onKeyDown={(event) => {
                        synchronizeCapsLock(event);
                        onKeyDown?.(event);
                    }}
                    onKeyUp={(event) => {
                        synchronizeCapsLock(event);
                        onKeyUp?.(event);
                    }}
                    onBlur={(event) => {
                        setIsCapsLockOn(false);
                        onBlur?.(event);
                    }}
                />

                <button
                    type="button"
                    aria-label={isVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                    aria-pressed={isVisible}
                    disabled={inputProps.disabled}
                    onClick={() => {
                        setIsVisible((currentValue) => !currentValue);
                    }}
                    className={cn(
                        "absolute end-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-lg",
                        "text-muted-foreground transition-colors",
                        "hover:bg-surface-muted hover:text-foreground",
                        "disabled:pointer-events-none disabled:opacity-50"
                    )}
                >
                    {isVisible ? (
                        <EyeOff aria-hidden="true" className="size-[1.125rem]" />
                    ) : (
                        <Eye aria-hidden="true" className="size-[1.125rem]" />
                    )}
                </button>

                <span
                    aria-hidden="true"
                    className={cn(
                        "pointer-events-none absolute inset-x-3 bottom-0 h-px",
                        "origin-center scale-x-0 bg-brand",
                        "transition-transform duration-300",
                        "group-focus-within:scale-x-100",
                        error && "scale-x-100 bg-danger"
                    )}
                />
            </div>

            <FieldMessage description={description} descriptionId={descriptionId} error={error} errorId={errorId} />

            <AnimatePresence initial={false}>
                {isCapsLockOn ? (
                    <motion.p
                        id={capsLockId}
                        role="status"
                        initial={
                            reduceMotion
                                ? false
                                : {
                                      opacity: 0,
                                      height: 0,
                                      y: -4,
                                  }
                        }
                        animate={{
                            opacity: 1,
                            height: "auto",
                            y: 0,
                        }}
                        exit={
                            reduceMotion
                                ? undefined
                                : {
                                      opacity: 0,
                                      height: 0,
                                      y: -4,
                                  }
                        }
                        transition={{
                            duration: reduceMotion ? 0 : 0.2,
                        }}
                        className="flex items-center gap-2 text-sm font-medium text-warning"
                    >
                        <AlertTriangle aria-hidden="true" className="size-4" />
                        زر الأحرف الكبيرة مفعّل
                    </motion.p>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
