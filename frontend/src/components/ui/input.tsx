import type {ComponentProps} from "react";

import {cn} from "@/lib/utils/cn";

type InputProps = ComponentProps<"input">;

export function Input({className, type = "text", ...props}: InputProps) {
    return (
        <input
            type={type}
            className={cn(
                "h-11 w-full rounded-xl border border-border bg-surface px-3 text-base text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/75 hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/25",
                className
            )}
            {...props}
        />
    );
}
