"use client";

import {AnimatePresence, motion, useReducedMotion} from "motion/react";
import {ArrowRight, HeartHandshake, ShieldCheck, Sparkles, Wifi} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import type {ReactNode} from "react";

import {BrandMark} from "@/components/brand/brand-mark";
import {ThemeToggle} from "@/components/theme/theme-toggle";
import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

type AuthShellProps = Readonly<{
    children: ReactNode;
}>;

type AuthScene = Readonly<{
    eyebrow: string;
    title: string;
    description: string;
    cardTitle: string;
    cardDescription: string;
}>;

const loginScene: AuthScene = {
    eyebrow: "مرحبًا بعودتك",
    title: "ارجع إلى مجتمعك، وتابع من حيث توقفت.",
    description: "سجّل دخولك للوصول إلى مساحتك والتفاعل مع المنشورات وإدارة محتواك في سند.",
    cardTitle: "عودة واضحة وسلسة",
    cardDescription: "ندير استعادة الجلسة في الخلفية، لتبقى التجربة بسيطة أمامك.",
};

const registerScene: AuthScene = {
    eyebrow: "ابدأ مساحتك",
    title: "صوتك يستحق مساحة واضحة ومحترمة.",
    description: "أنشئ حسابك بخطوات قليلة، ثم شارك وتفاعل ضمن تجربة عربية صُممت للمجتمع.",
    cardTitle: "بداية هادئة",
    cardDescription: "بيانات أساسية فقط للبدء، دون خطوات طويلة أو معلومات غير ضرورية.",
};

const experienceSignals = [
    {
        icon: HeartHandshake,
        title: "واجهة عربية أولًا",
        description: "تجربة RTL واضحة من أول خطوة.",
    },
    {
        icon: Wifi,
        title: "مراعاة الاتصال",
        description: "حالات واضحة عند البطء أو انقطاع الشبكة.",
    },
    {
        icon: ShieldCheck,
        title: "حدود خصوصية واضحة",
        description: "لا نعرض البيانات الخاصة في الواجهة العامة.",
    },
] as const;

export function AuthShell({children}: AuthShellProps) {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();

    const isRegisterPage = pathname.startsWith("/register");
    const scene = isRegisterPage ? registerScene : loginScene;

    return (
        <div className="relative isolate min-h-dvh overflow-hidden bg-background">
            <div aria-hidden="true" className="hero-mesh pointer-events-none absolute inset-0 -z-20 opacity-75" />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -start-40 top-1/3 -z-10 size-[28rem] rounded-full bg-brand/8 blur-3xl"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -end-44 -top-52 -z-10 size-[34rem] rounded-full bg-accent/10 blur-3xl"
            />

            <header className="relative z-30 mx-auto flex min-h-20 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <Link href="/" aria-label="سند — العودة إلى الرئيسية" className="rounded-xl">
                    <BrandMark priority />
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        href="/"
                        className={cn(
                            buttonVariants({
                                variant: "ghost",
                                size: "sm",
                            }),
                            "hidden sm:inline-flex"
                        )}
                    >
                        <ArrowRight aria-hidden="true" />
                        العودة للرئيسية
                    </Link>

                    <ThemeToggle />
                </div>
            </header>

            <main className="relative mx-auto grid min-h-[calc(100dvh-5rem)] max-w-[90rem] lg:grid-cols-[minmax(0,0.88fr)_minmax(32rem,1.12fr)]">
                <section className="relative z-10 flex items-center justify-center px-4 pb-10 pt-4 sm:px-6 lg:px-10 lg:py-12 xl:px-16">
                    <div className="w-full max-w-[32rem]">
                        <div className="mb-7 lg:hidden">
                            <motion.div
                                key={`${pathname}-mobile-intro`}
                                initial={
                                    reduceMotion
                                        ? false
                                        : {
                                              opacity: 0,
                                              y: 12,
                                          }
                                }
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                transition={{
                                    duration: 0.45,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                                className="grid gap-3"
                            >
                                <span className="section-kicker">{scene.eyebrow}</span>

                                <p className="max-w-md text-sm leading-7 text-muted-foreground">{scene.description}</p>
                            </motion.div>
                        </div>

                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={pathname}
                                initial={
                                    reduceMotion
                                        ? false
                                        : {
                                              opacity: 0,
                                              x: -24,
                                              y: 8,
                                          }
                                }
                                animate={{
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                }}
                                exit={
                                    reduceMotion
                                        ? undefined
                                        : {
                                              opacity: 0,
                                              x: 18,
                                              y: -4,
                                          }
                                }
                                transition={{
                                    duration: 0.42,
                                    ease: [0.22, 1, 0.36, 1],
                                }}
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                <aside className="relative m-4 hidden min-h-[calc(100dvh-7rem)] overflow-hidden rounded-[2.25rem] border border-white/10 bg-[linear-gradient(145deg,var(--hero-deep),var(--hero-mid)_56%,var(--hero-warm))] text-white shadow-[0_36px_100px_rgba(3,28,58,0.24)] lg:flex lg:flex-col lg:justify-between lg:p-10 xl:p-14">
                    <div aria-hidden="true" className="hero-grid pointer-events-none absolute inset-0 opacity-25" />

                    <motion.div
                        aria-hidden="true"
                        className="absolute -end-32 -top-36 size-[30rem] rounded-full border border-white/10 bg-white/5"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      scale: [1, 1.07, 1],
                                      rotate: [0, 8, 0],
                                  }
                        }
                        transition={{
                            duration: 11,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    <motion.div
                        aria-hidden="true"
                        className="absolute -bottom-32 -start-24 size-[24rem] rounded-full border border-white/10 bg-cyan-300/5"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      scale: [1.05, 0.96, 1.05],
                                      x: [0, 18, 0],
                                  }
                        }
                        transition={{
                            duration: 9,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    <motion.div
                        aria-hidden="true"
                        className="absolute end-[14%] top-[34%] size-3 rounded-full bg-amber-300 shadow-[0_0_28px_rgba(252,211,77,0.85)]"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      y: [0, -14, 0],
                                      opacity: [0.65, 1, 0.65],
                                  }
                        }
                        transition={{
                            duration: 4.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={`${pathname}-scene`}
                            className="relative z-10 grid max-w-2xl gap-7"
                            initial={
                                reduceMotion
                                    ? false
                                    : {
                                          opacity: 0,
                                          y: 24,
                                      }
                            }
                            animate={{
                                opacity: 1,
                                y: 0,
                            }}
                            exit={
                                reduceMotion
                                    ? undefined
                                    : {
                                          opacity: 0,
                                          y: -16,
                                      }
                            }
                            transition={{
                                duration: 0.6,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold text-white/85 backdrop-blur-md">
                                <Sparkles aria-hidden="true" className="size-4 text-amber-300" />
                                {scene.eyebrow}
                            </div>

                            <div className="grid gap-5">
                                <h1 className="max-w-3xl text-balance text-4xl font-bold leading-[1.3] tracking-[-0.035em] xl:text-5xl">
                                    {scene.title}
                                </h1>

                                <p className="max-w-2xl text-base leading-8 text-white/70 xl:text-lg xl:leading-9">
                                    {scene.description}
                                </p>
                            </div>

                            <ul className="grid gap-3 xl:grid-cols-3" aria-label="مزايا تجربة سند">
                                {experienceSignals.map(({icon: Icon, title, description}) => (
                                    <li
                                        key={title}
                                        className="rounded-2xl border border-white/10 bg-black/10 p-4 backdrop-blur-sm"
                                    >
                                        <span className="mb-4 grid size-10 place-items-center rounded-xl bg-white/10">
                                            <Icon aria-hidden="true" className="size-5 text-amber-300" />
                                        </span>

                                        <strong className="block text-sm text-white">{title}</strong>

                                        <span className="mt-1 block text-xs leading-6 text-white/55">
                                            {description}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </AnimatePresence>

                    <motion.div
                        className="relative z-10 mt-12 max-w-lg rounded-[1.75rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl"
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      y: [0, -7, 0],
                                  }
                        }
                        transition={{
                            duration: 6.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    >
                        <div className="flex items-start gap-4">
                            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-amber-300/15 text-amber-300">
                                <ShieldCheck aria-hidden="true" className="size-5" />
                            </span>

                            <div className="grid gap-1">
                                <strong className="text-sm text-white">{scene.cardTitle}</strong>

                                <p className="text-sm leading-7 text-white/60">{scene.cardDescription}</p>
                            </div>
                        </div>

                        <div aria-hidden="true" className="mt-5 flex items-center gap-2">
                            <span className="h-1.5 flex-1 rounded-full bg-amber-300" />
                            <span className="h-1.5 flex-1 rounded-full bg-white/28" />
                            <span className="h-1.5 flex-1 rounded-full bg-white/14" />
                        </div>
                    </motion.div>

                    <p className="relative z-10 mt-8 text-xs leading-6 text-white/48">
                        يمكنك تصفح المنشورات العامة في سند دون إنشاء حساب.
                    </p>
                </aside>
            </main>
        </div>
    );
}
