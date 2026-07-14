import type {ComponentProps} from "react";

import {cn} from "@/lib/utils/cn";

export function Card({className, ...props}: ComponentProps<"article">) {
    return (
        <article
            className={cn("rounded-lg border border-border bg-surface text-foreground shadow-sm", className)}
            {...props}
        />
    );
}

export function CardHeader({className, ...props}: ComponentProps<"header">) {
    return <header className={cn("grid gap-2 p-5", className)} {...props} />;
}

export function CardContent({className, ...props}: ComponentProps<"div">) {
    return <div className={cn("px-5 pb-5", className)} {...props} />;
}

export function CardFooter({className, ...props}: ComponentProps<"footer">) {
    return <footer className={cn("flex flex-wrap items-center gap-3 border-t border-border p-5", className)} {...props} />;
}
