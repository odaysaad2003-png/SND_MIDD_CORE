import {ArrowUpLeft, HeartHandshake, ShieldCheck, Sparkles} from "lucide-react";
import Link from "next/link";

import {BrandMark} from "@/components/brand/brand-mark";

const footerLinks = [
    {
        title: "الاستكشاف",
        links: [
            {href: "/", label: "الرئيسية"},
            {href: "/posts", label: "المنشورات العامة"},
            {href: "/#how-it-works", label: "كيف يعمل سند؟"},
        ],
    },
    {
        title: "الثقة",
        links: [
            {href: "/privacy", label: "الخصوصية"},
            {href: "/community-guidelines", label: "إرشادات المجتمع"},
            {href: "/#faq", label: "الأسئلة الشائعة"},
        ],
    },
] as const;

export function PublicFooter() {
    return (
        <footer className="relative overflow-hidden border-t border-border bg-surface">
            <div aria-hidden="true" className="absolute -end-24 -top-24 size-72 rounded-full bg-brand/8 blur-3xl" />
            <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
                <div className="grid gap-10 border-b border-border pb-10 md:grid-cols-[1.35fr_0.65fr_0.65fr]">
                    <div className="grid max-w-md gap-5">
                        <Link href="/" aria-label="سند — الرئيسية" className="w-fit rounded-xl">
                            <BrandMark imageClassName="size-14" />
                        </Link>
                        <p className="text-sm leading-7 text-muted-foreground">
                            مساحة عربية لقراءة ما يشاركه المجتمع، والوصول إلى المشاركة في الوقت الذي تختاره.
                        </p>
                        <Link href="/posts" className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand">
                            انتقل إلى المجتمع
                            <ArrowUpLeft aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>

                    {footerLinks.map((group) => (
                        <nav key={group.title} aria-label={group.title} className="grid content-start gap-4">
                            <h2 className="text-sm font-bold text-foreground">{group.title}</h2>
                            <ul className="grid gap-3 text-sm text-muted-foreground">
                                {group.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={link.href} className="rounded-sm transition-colors hover:text-brand">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    ))}
                </div>

                <div className="flex flex-col gap-5 pt-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>© 2026 سند. تجربة عربية تبدأ بالإنسان.</p>
                    <ul className="flex flex-wrap items-center gap-x-5 gap-y-2" aria-label="مبادئ سند">
                        <li className="inline-flex items-center gap-1.5"><Sparkles aria-hidden="true" className="size-3.5 text-brand" /> عربي أولًا</li>
                        <li className="inline-flex items-center gap-1.5"><ShieldCheck aria-hidden="true" className="size-3.5 text-brand" /> خصوصية واضحة</li>
                        <li className="inline-flex items-center gap-1.5"><HeartHandshake aria-hidden="true" className="size-3.5 text-brand" /> قراءة قبل التسجيل</li>
                    </ul>
                </div>
            </div>
        </footer>
    );
}
