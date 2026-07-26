import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";
import type {ComponentProps} from "react";

import {cn} from "@/lib/utils/cn";

const buttonVariants = cva(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-[transform,background-color,border-color,color,box-shadow] duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-55 aria-busy:cursor-wait [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                primary: "bg-brand text-brand-foreground shadow-[0_8px_22px_color-mix(in_oklch,var(--brand)_22%,transparent)] hover:bg-brand/90 hover:shadow-[0_10px_28px_color-mix(in_oklch,var(--brand)_28%,transparent)] active:bg-brand/80",
                secondary: "border border-border bg-surface text-foreground shadow-sm hover:border-brand/20 hover:bg-surface-muted",
                ghost: "text-foreground hover:bg-surface-muted",
                danger: "bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/80",
                link: "min-h-0 px-0 text-brand underline-offset-4 hover:underline",
            },
            size: {
                default: "h-11",
                sm: "h-9 min-h-9 px-3",
                lg: "h-12 px-6 text-base",
                icon: "size-11 px-0",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
);

type ButtonProps = ComponentProps<"button"> &
    VariantProps<typeof buttonVariants> &
    Readonly<{
        asChild?: boolean;
    }>;

export function Button({asChild = false, className, size, variant, ...props}: ButtonProps) {
    const Component = asChild ? Slot : "button";

    return <Component className={cn(buttonVariants({size, variant}), className)} {...props} />;
}

export {buttonVariants};
