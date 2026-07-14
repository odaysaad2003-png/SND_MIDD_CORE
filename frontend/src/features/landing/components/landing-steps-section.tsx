import {BookOpenText, MessageCircleMore, UserRoundCheck} from "lucide-react";

import {LandingReveal} from "./landing-reveal";

const participationSteps = [
    {icon: BookOpenText, number: "01", title: "استكشف", description: "اقرأ المنشورات العامة وابحث فيها دون إنشاء حساب."},
    {icon: UserRoundCheck, number: "02", title: "قرّر", description: "يظهر التسجيل عندما تريد النشر أو التفاعل، لا قبل الاستفادة."},
    {icon: MessageCircleMore, number: "03", title: "شارك", description: "انضم إلى المساحة المجتمعية مع حدود واضحة واحترام متبادل."},
] as const;

export function LandingStepsSection() {
    return (
        <section id="how-it-works" aria-labelledby="how-it-works-heading" className="scroll-mt-28 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
            <LandingReveal className="mx-auto grid max-w-7xl gap-10">
                <header className="grid max-w-3xl gap-3">
                    <p className="section-kicker">من القراءة إلى المشاركة</p>
                    <h2 id="how-it-works-heading" className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                        تجربة لا تطلب منك شيئًا قبل أن تمنحك قيمة.
                    </h2>
                </header>

                <ol className="grid gap-4 lg:grid-cols-3">
                    {participationSteps.map(({icon: Icon, number, title, description}) => (
                        <li key={number} className="group relative min-h-64 overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-xl sm:p-7">
                            <span className="absolute end-5 top-3 text-6xl font-bold tracking-tighter text-brand/8 transition-colors group-hover:text-brand/13">{number}</span>
                            <div className="relative grid h-full content-between gap-10">
                                <span className="grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand"><Icon aria-hidden="true" className="size-5" /></span>
                                <div className="grid gap-3">
                                    <h3 className="text-2xl font-bold text-foreground">{title}</h3>
                                    <p className="leading-8 text-muted-foreground">{description}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>
            </LandingReveal>
        </section>
    );
}
