import type {ComponentProps} from "react";

import {cn} from "@/lib/utils/cn";

type TextareaProps = ComponentProps<"textarea">;

export function Textarea({className, ...props}: TextareaProps) {
    return (
        <textarea
            className={cn(
                "min-h-36 w-full resize-y rounded-2xl border border-border bg-surface px-4 py-3 text-base leading-7 text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/75 hover:border-border-strong disabled:cursor-not-allowed disabled:opacity-65 aria-invalid:border-danger aria-invalid:ring-2 aria-invalid:ring-danger/25",
                className
            )}
            {...props}
        />
    );
}
