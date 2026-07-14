import {ArrowLeft} from "lucide-react";
import Link from "next/link";
import {Suspense} from "react";

import {buttonVariants} from "@/components/ui/button";
import {PublicFeedPreview, PublicFeedPreviewSkeleton} from "@/features/posts/server";
import {cn} from "@/lib/utils/cn";

import {LandingReveal} from "./landing-reveal";

export function LandingFeedSection() {
    return (
        <section id="public-feed-preview" aria-labelledby="public-feed-preview-heading" className="relative border-y border-border bg-surface-muted/55 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <LandingReveal className="mx-auto grid max-w-7xl gap-9">
                <header className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div className="grid max-w-3xl gap-3">
                        <p className="section-kicker">نبض المجتمع</p>
                        <h2 id="public-feed-preview-heading" className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                            آخر ما وصل إلى المساحة العامة.
                        </h2>
                        <p className="max-w-2xl leading-8 text-muted-foreground">معاينة مباشرة لأحدث المحتوى العام، مع تحديث هادئ دون إرباك القراءة.</p>
                    </div>
                    <Link href="/posts" className={cn(buttonVariants({variant: "secondary"}), "w-fit")}>
                        جميع المنشورات
                        <ArrowLeft aria-hidden="true" />
                    </Link>
                </header>

                <Suspense fallback={<PublicFeedPreviewSkeleton />}>
                    <PublicFeedPreview />
                </Suspense>
            </LandingReveal>
        </section>
    );
}
