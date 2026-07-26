import Image from "next/image";

import {isSupportedRemoteImage} from "@/lib/media/is-supported-remote-image";

import type {PublicPost} from "../schemas/public-posts.schema";

type PublicPostImagesProps = Readonly<{
    images: PublicPost["images"];
    title: string;
}>;

export function PublicPostImages({images, title}: PublicPostImagesProps) {
    const supportedImages = images.filter(isSupportedRemoteImage);

    if (supportedImages.length === 0) {
        return null;
    }

    const imageSizes = supportedImages.length === 1
        ? "(max-width: 768px) 100vw, 42rem"
        : "(max-width: 768px) 50vw, 21rem";

    return (
        <ul className={supportedImages.length === 1 ? "grid gap-2" : "grid grid-cols-2 gap-2"}>
            {supportedImages.map((image, index) => (
                <li
                    key={`${image}-${index}`}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-muted"
                >
                    <Image
                        src={image}
                        alt={
                            supportedImages.length === 1
                                ? `صورة مرفقة بالمنشور: ${title}`
                                : `الصورة ${index + 1} المرفقة بالمنشور: ${title}`
                        }
                        fill
                        sizes={imageSizes}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                </li>
            ))}
        </ul>
    );
}
