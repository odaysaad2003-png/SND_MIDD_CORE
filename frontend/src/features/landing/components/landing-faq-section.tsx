import {Plus} from "lucide-react";

import {LandingReveal} from "./landing-reveal";

const questions = [
    {question: "هل أحتاج إلى حساب لقراءة المنشورات؟", answer: "لا. المنشورات العامة وتفاصيلها وتعليقاتها متاحة للقراءة دون تسجيل."},
    {question: "متى يُطلب تسجيل الدخول؟", answer: "عند محاولة النشر أو الإعجاب أو الحفظ أو التعليق أو الإبلاغ."},
    {question: "هل توجد ملفات شخصية عامة؟", answer: "ليست ضمن النسخة الأولى؛ يظهر اسم الكاتب وصورته فقط دون رابط لصفحة عامة."},
] as const;

export function LandingFaqSection() {
    return (
        <section
            id="faq"
            aria-labelledby="faq-heading"
            className="scroll-mt-28 px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20 lg:px-8"
        >
            <LandingReveal className="mx-auto grid max-w-5xl gap-9 lg:grid-cols-[0.7fr_1.3fr]">
                <header className="grid content-start gap-3">
                    <p className="section-kicker">قبل أن تبدأ</p>
                    <h2 id="faq-heading" className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        إجابات مباشرة.
                    </h2>
                </header>

                <div className="grid gap-3">
                    {questions.map((item) => (
                        <details
                            key={item.question}
                            className="group rounded-2xl border border-border bg-surface px-5 open:border-brand/25 open:shadow-lg sm:px-6"
                        >
                           
                                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-foreground [&::-webkit-details-marker]:hidden">
                                    {item.question}
                                    <Plus
                                        aria-hidden="true"
                                        className="size-5 shrink-0 text-brand transition-transform duration-300 group-open:rotate-45"
                                    />
                                </summary>
                                <p className="border-t border-border pb-5 pt-4 leading-8 text-muted-foreground">
                                    {item.answer}
                                </p>
                            
                        </details>
                    ))}
                </div>
            </LandingReveal>
        </section>
    );
}
