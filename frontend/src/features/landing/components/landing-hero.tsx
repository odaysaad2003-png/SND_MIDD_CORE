"use client";

import {ArrowLeft, Eye, Radio, ShieldCheck, Sparkles, Users} from "lucide-react";
import {motion, useReducedMotion} from "motion/react";
import Link from "next/link";

import {BrandMark} from "@/components/brand/brand-mark";
import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

const heroSignals = [
    {icon: Eye, label: "تصفّح عام", detail: "دون حساب"},
    {icon: Users, label: "مجتمع عربي", detail: "واجهة عربية أولًا"},
    {icon: ShieldCheck, label: "حدود واضحة", detail: "خصوصية وصلاحيات"},
] as const;

export function LandingHero() {
    const reduceMotion = useReducedMotion();

    return (
        <section className="relative isolate px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-10 lg:px-8">
            <div aria-hidden="true" className="hero-mesh absolute inset-x-0 top-0 -z-10 h-[44rem] opacity-80" />

            <div className="relative mx-auto grid min-h-[38rem] max-w-7xl overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,var(--hero-deep),var(--hero-mid)_58%,var(--hero-warm))] px-5 py-8 text-white shadow-[0_32px_90px_rgba(3,28,58,0.22)] sm:px-8 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-14">
                <div aria-hidden="true" className="hero-grid absolute inset-0 opacity-20" />
                <motion.div
                    aria-hidden="true"
                    className="absolute -end-24 -top-32 size-[28rem] rounded-full border border-white/10 bg-white/5 blur-sm"
                    animate={reduceMotion ? undefined : {scale: [1, 1.06, 1], opacity: [0.35, 0.55, 0.35]}}
                    transition={{duration: 8, repeat: Infinity, ease: "easeInOut"}}
                />

                <motion.div
                    className="relative z-10 grid max-w-3xl gap-6"
                    initial={reduceMotion ? false : {opacity: 0, y: 24}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.7, ease: [0.22, 1, 0.36, 1]}}
                >
                    <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold text-white/85 backdrop-blur">
                        <span className="relative flex size-2">
                            <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-300 opacity-70" />
                            <span className="relative inline-flex size-2 rounded-full bg-amber-300" />
                        </span>
                        مساحة المجتمع، مفتوحة للقراءة
                    </div>

                    <div className="grid gap-5">
                        <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.22] tracking-[-0.035em] sm:text-5xl lg:text-6xl xl:text-7xl">
                            حين يحتاج الصوت إلى مساحة،
                            <span className="hero-highlight mt-1 block">يبدأ سند.</span>
                        </h1>
                        <p className="max-w-2xl text-base leading-8 text-white/72 sm:text-lg sm:leading-9">
                            اكتشف المنشورات العامة أولًا، وافهم ما يدور حولك، ثم شارك عندما تصبح لديك نية حقيقية للتفاعل.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link href="/posts" className={cn(buttonVariants({size: "lg"}), "bg-white text-slate-950 shadow-xl hover:bg-white/90")}>
                            ادخل إلى المجتمع
                            <ArrowLeft aria-hidden="true" />
                        </Link>
                        <Link href="/#how-it-works" className={cn(buttonVariants({size: "lg", variant: "secondary"}), "border-white/18 bg-white/8 text-white backdrop-blur hover:bg-white/14")}>
                            <Sparkles aria-hidden="true" />
                            كيف يعمل سند؟
                        </Link>
                    </div>

                    <ul className="grid gap-2 pt-2 sm:grid-cols-3" aria-label="مزايا الاستكشاف العام">
                        {heroSignals.map(({icon: Icon, label, detail}) => (
                            <li key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/8 p-3 backdrop-blur-sm">
                                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10">
                                    <Icon aria-hidden="true" className="size-4 text-amber-300" />
                                </span>
                                <span className="grid text-xs leading-5">
                                    <strong className="text-white">{label}</strong>
                                    <span className="text-white/55">{detail}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </motion.div>

                <div className="relative mt-10 min-h-[25rem] lg:mt-0" aria-label="تصور بصري لتدفق المجتمع">
                    <motion.div
                        aria-hidden="true"
                        className="absolute inset-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12"
                        animate={reduceMotion ? undefined : {rotate: 360}}
                        transition={{duration: 28, repeat: Infinity, ease: "linear"}}
                    >
                        <span className="absolute -top-2 left-1/2 size-4 rounded-full bg-amber-300 shadow-[0_0_26px_rgba(252,211,77,0.8)]" />
                        <span className="absolute bottom-8 end-3 size-3 rounded-full bg-cyan-300 shadow-[0_0_22px_rgba(103,232,249,0.75)]" />
                    </motion.div>
                    <div aria-hidden="true" className="absolute inset-1/2 size-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-white/15" />

                    <motion.div
                        className="absolute inset-1/2 grid size-36 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[2rem] border border-white/15 bg-white/10 shadow-2xl backdrop-blur-xl"
                        initial={reduceMotion ? false : {scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{delay: 0.25, duration: 0.6}}
                    >
                        <BrandMark compact priority imageClassName="size-24 rounded-[1.4rem] p-3" />
                    </motion.div>

                    <motion.div
                        className="absolute end-0 top-4 w-52 rounded-2xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-xl sm:end-8"
                        animate={reduceMotion ? undefined : {y: [0, -10, 0]}}
                        transition={{duration: 5.5, repeat: Infinity, ease: "easeInOut"}}
                    >
                        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/80">
                            <Radio aria-hidden="true" className="size-4 text-amber-300" />
                            منشورات عامة
                        </div>
                        <div className="grid gap-2">
                            <span className="h-2 w-3/4 rounded-full bg-white/55" />
                            <span className="h-2 w-full rounded-full bg-white/16" />
                            <span className="h-2 w-5/6 rounded-full bg-white/16" />
                        </div>
                    </motion.div>

                    <motion.div
                        className="absolute bottom-5 start-0 w-48 rounded-2xl border border-white/15 bg-[#061c36]/65 p-4 shadow-2xl backdrop-blur-xl sm:start-6"
                        animate={reduceMotion ? undefined : {y: [0, 9, 0]}}
                        transition={{duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 0.6}}
                    >
                        <div className="flex items-center gap-3">
                            <span className="grid size-10 place-items-center rounded-full bg-amber-300/15 text-amber-300"><Users aria-hidden="true" className="size-5" /></span>
                            <span className="grid text-xs leading-5">
                                <strong>اقرأ أولًا</strong>
                                <span className="text-white/55">شارك عند النية</span>
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
