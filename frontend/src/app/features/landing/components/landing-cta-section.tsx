import {ArrowLeft, Sparkles} from "lucide-react";
import Link from "next/link";

import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

import {LandingReveal} from "./landing-reveal";

export function LandingCtaSection() {
    return (
        <section aria-labelledby="participation-heading" className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
            <LandingReveal className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-brand/20 bg-[linear-gradient(120deg,color-mix(in_oklch,var(--brand)_16%,var(--surface)),var(--surface-raised))] p-7 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
                <div aria-hidden="true" className="absolute -end-24 -top-28 size-80 rounded-full bg-accent/16 blur-3xl" />
                <div className="relative grid max-w-3xl gap-4">
                    <span className="grid size-11 place-items-center rounded-2xl bg-brand text-brand-foreground"><Sparkles aria-hidden="true" className="size-5" /></span>
                    <h2 id="participation-heading" className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">ابدأ بما يهمك الآن: القراءة.</h2>
                    <p className="leading-8 text-muted-foreground">اكتشف ما يشاركه المجتمع، واترك قرار المشاركة للحظة التي تناسبك.</p>
                </div>
                <Link href="/posts" className={cn(buttonVariants({size: "lg"}), "relative mt-7 w-fit lg:mt-0")}>
                    تصفّح المجتمع
                    <ArrowLeft aria-hidden="true" />
                </Link>
            </LandingReveal>
        </section>
    );
}
