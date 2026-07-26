import {Eye, Fingerprint, ShieldCheck} from "lucide-react";

import {LandingReveal} from "./landing-reveal";

const trustPoints = [
    {icon: Eye, title: "القراءة عامة", description: "لا يُطلب حساب لمجرد استكشاف المنشورات العامة والتعليقات."},
    {icon: Fingerprint, title: "هوية محدودة", description: "تظهر هوية الكاتب العامة بالاسم والصورة فقط ضمن العقد الحالي."},
    {icon: ShieldCheck, title: "صلاحيات صادقة", description: "التفاعل والإبلاغ يتطلبان حسابًا، والـBackend يبقى صاحب قرار الصلاحية."},
] as const;

export function LandingTrustSection() {
    return (
        <section id="trust-and-safety" aria-labelledby="trust-heading" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <LandingReveal className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
                <header className="grid gap-4 lg:sticky lg:top-28">
                    <p className="section-kicker">الثقة ليست نصًا صغيرًا</p>
                    <h2 id="trust-heading" className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">حدود واضحة، قبل أول نقرة.</h2>
                    <p className="max-w-xl leading-8 text-muted-foreground">واجهة سند لا تدّعي صلاحيات أو نتائج لا يملكها النظام، وتفصل بين ما هو عام وما يحتاج إلى حساب.</p>
                </header>

                <ul className="grid gap-4">
                    {trustPoints.map(({icon: Icon, title, description}, index) => (
                        <li key={title} className="grid gap-4 rounded-[1.75rem] border border-border bg-surface p-6 sm:grid-cols-[auto_1fr] sm:items-start sm:p-7">
                            <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand"><Icon aria-hidden="true" className="size-5" /></span>
                            <div className="grid gap-2">
                                <p className="text-xs font-semibold tracking-wider text-brand">0{index + 1}</p>
                                <h3 className="text-xl font-bold text-foreground">{title}</h3>
                                <p className="leading-8 text-muted-foreground">{description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </LandingReveal>
        </section>
    );
}
