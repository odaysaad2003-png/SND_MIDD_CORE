import Image from "next/image";

import {isSupportedRemoteImage} from "@/lib/media/is-supported-remote-image";
import {cn} from "@/lib/utils/cn";

type AvatarProps = Readonly<{
    className?: string;
    imageUrl?: string | null;
    name: string;
    sizes?: string;
}>;

export function Avatar({className, imageUrl, name, sizes = "44px"}: AvatarProps) {
    const initial = Array.from(name.trim())[0] ?? "س";
    const supportedImage = isSupportedRemoteImage(imageUrl) ? imageUrl : null;

    return (
        <span
            aria-hidden="true"
            className={cn(
                "relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand/15 bg-brand/10 text-sm font-bold text-brand",
                className,
            )}
        >
            {supportedImage ? (
                <Image src={supportedImage} alt="" fill sizes={sizes} className="object-cover" />
            ) : (
                initial
            )}
        </span>
    );
}
