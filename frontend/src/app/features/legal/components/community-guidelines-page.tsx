import Link from "next/link";

import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

const communityPrinciples = [
    {
        title: "شارك بوضوح واحترام",
        description: "اكتب محتوى مفهومًا وتجنب الإساءة الشخصية أو المضايقة أو خطاب الكراهية.",
    },
    {
        title: "لا تنشر محتوى ضارًا",
        description: "تجنب التهديدات والعنف والمحتوى الجنسي والاحتيال أو أي مادة تعرّض الآخرين للخطر.",
    },
    {
        title: "تجنب التضليل والإزعاج",
        description: "لا تستخدم المنصة للرسائل المزعجة أو الخداع أو نشر معلومات تعرف أنها مضللة.",
    },
    {
        title: "استخدم الإبلاغ بمسؤولية",
        description: "الإبلاغ يرسل المحتوى للمراجعة، لكنه لا يمثل وعدًا بنتيجة إدارية محددة أو فورية.",
    },
] as const;

export function CommunityGuidelinesPage() {
    return (
        <div className="px-4 py-10 sm:px-6 sm:py-14">
            <article className="mx-auto grid max-w-3xl gap-8 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <header className="grid gap-3">
                    <p className="text-sm font-semibold text-brand">مساحة مجتمعية مسؤولة</p>
                    <h1 className="text-3xl font-bold text-foreground sm:text-4xl">إرشادات مجتمع سند</h1>
                    <p className="leading-8 text-muted-foreground">
                        تساعد هذه المبادئ على إبقاء القراءة والمشاركة أكثر وضوحًا وأمانًا للجميع.
                    </p>
                </header>

                <ol className="grid gap-4">
                    {communityPrinciples.map((principle, index) => (
                        <li key={principle.title} className="grid gap-2 rounded-lg border border-border bg-surface-raised p-5">
                            <div className="flex items-center gap-3">
                                <span
                                    aria-hidden="true"
                                    className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface-muted font-bold text-brand"
                                >
                                    {index + 1}
                                </span>
                                <h2 className="text-lg font-bold text-foreground">{principle.title}</h2>
                            </div>
                            <p className="leading-7 text-muted-foreground">{principle.description}</p>
                        </li>
                    ))}
                </ol>

                <div className="flex flex-wrap gap-3">
                    <Link href="/posts" className={cn(buttonVariants({variant: "secondary"}))}>
                        العودة للمنشورات
                    </Link>
                    <Link href="/privacy" className={cn(buttonVariants({variant: "ghost"}))}>
                        قراءة مبادئ الخصوصية
                    </Link>
                </div>
            </article>
        </div>
    );
}
