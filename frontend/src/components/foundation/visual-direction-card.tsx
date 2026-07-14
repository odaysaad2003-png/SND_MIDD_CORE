import {ArrowLeft, Heart, MessageCircle} from "lucide-react";

import {cn} from "@/lib/utils/cn";

const directionStyles = {
    calm: {
        accent: "bg-sky-700 text-white",
        frame: "border-slate-200 bg-slate-50 text-slate-950",
        muted: "bg-white text-slate-600",
    },
    editorial: {
        accent: "bg-violet-800 text-white",
        frame: "border-violet-200 bg-[#fbf8ff] text-[#251934]",
        muted: "bg-white text-violet-950/65",
    },
    warm: {
        accent: "bg-emerald-800 text-white",
        frame: "border-amber-200 bg-[#fffaf0] text-[#2d2a24]",
        muted: "bg-white text-stone-600",
    },
} as const;

type VisualDirectionCardProps = Readonly<{
    description: string;
    direction: keyof typeof directionStyles;
    name: string;
    selected?: boolean;
}>;

export function VisualDirectionCard({description, direction, name, selected = false}: VisualDirectionCardProps) {
    const styles = directionStyles[direction];

    return (
        <article
            className={cn(
                "relative overflow-hidden rounded-xl border shadow-sm",
                selected && "ring-2 ring-brand ring-offset-4 ring-offset-background",
                styles.frame
            )}
        >
            {selected ? (
                <span className="absolute end-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground">
                    الاتجاه المعتمد
                </span>
            ) : null}
            <header className="grid gap-2 border-b border-current/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.16em]">اتجاه بصري</p>
                <h3 className="text-xl font-bold">{name}</h3>
                <p className="text-sm leading-6 opacity-75">{description}</p>
            </header>

            <div className="grid gap-4 p-4">
                <section className={cn("rounded-lg p-4", styles.muted)} aria-label={`نموذج مقدمة ${name}`}>
                    <p className="text-xs font-bold">سند · SND</p>
                    <p className="mt-2 text-lg font-bold">مساحة أقرب للناس</p>
                    <p className="mt-1 text-xs leading-5 opacity-75">نموذج بصري فقط، وليس نصًا نهائيًا للمنتج.</p>
                    <span
                        className={cn(
                            "mt-3 inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-xs font-bold",
                            styles.accent
                        )}
                    >
                        استكشف النموذج <ArrowLeft className="size-3.5" aria-hidden="true" />
                    </span>
                </section>

                <section
                    className="rounded-lg border border-current/10 bg-white/85 p-4 text-slate-950"
                    aria-label={`نموذج منشور ${name}`}
                >
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="size-8 rounded-full bg-slate-200" aria-hidden="true" />
                        <span>عضو من المجتمع · اليوم</span>
                    </div>
                    <p className="mt-3 font-bold">عنوان منشور مجتمعي تجريبي</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                        نستخدم نفس المحتوى لمقارنة الأسلوب لاختبار عادِل بين الاتجاهات.
                    </p>
                    <div className="mt-3 flex gap-4 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                            <Heart className="size-4" aria-hidden="true" /> إعجاب
                        </span>
                        <span className="inline-flex items-center gap-1">
                            <MessageCircle className="size-4" aria-hidden="true" /> تعليق
                        </span>
                    </div>
                </section>

                <section
                    className="rounded-lg border border-dashed border-current/25 p-4 text-center"
                    aria-label={`نموذج حالة فارغة ${name}`}
                >
                    <p className="text-sm font-bold">لا توجد نتائج الآن</p>
                    <p className="mt-1 text-xs opacity-70">جرّب إزالة البحث أو العودة لاحقًا.</p>
                </section>
            </div>
        </article>
    );
}
