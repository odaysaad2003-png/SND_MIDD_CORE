import type {ReactNode} from "react";

import {cn} from "@/lib/utils/cn";

type FieldProps = Readonly<{
    children: ReactNode;
    className?: string;
    description?: string;
    error?: string;
    htmlFor: string;
    label: string;
    required?: boolean;
}>;

export function Field({children, className, description, error, htmlFor, label, required}: FieldProps) {
    const descriptionId = description ? `${htmlFor}-description` : undefined;
    const errorId = error ? `${htmlFor}-error` : undefined;

    return (
        <div className={cn("grid gap-2", className)}>
            <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
                {label}
                {required ? <span className="me-1 text-danger" aria-hidden="true">*</span> : null}
            </label>
            {children}
            {description ? (
                <p id={descriptionId} className="text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            ) : null}
            {error ? (
                <p id={errorId} className="text-sm font-medium text-danger">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
