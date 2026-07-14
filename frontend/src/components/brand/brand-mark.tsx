import Image from "next/image";

import {cn} from "@/lib/utils/cn";

type BrandMarkProps = Readonly<{
    className?: string;
    compact?: boolean;
    imageClassName?: string;
    priority?: boolean;
}>;

export function BrandMark({className, compact = false, imageClassName, priority = false}: BrandMarkProps) {
    return (
        <span className={cn("inline-flex items-center gap-3", className)}>
            <span
                className={cn(
                    "relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-black/8 bg-white p-1.5 shadow-[0_8px_24px_rgba(0,34,82,0.12)]",
                    imageClassName,
                )}
            >
                <Image src="/brand/snd-logo.png" alt="" width={800} height={800} priority={priority} className="size-full object-contain" />
            </span>
            {!compact ? (
                <span className="grid leading-none">
                    <span className="text-base font-bold tracking-tight text-foreground">سند</span>
                    <span dir="ltr" className="mt-1 text-[0.62rem] font-semibold tracking-[0.28em] text-muted-foreground">
                        SND
                    </span>
                </span>
            ) : null}
        </span>
    );
}
