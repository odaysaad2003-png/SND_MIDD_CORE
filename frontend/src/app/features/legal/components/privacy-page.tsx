import Link from "next/link";

import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

export function PrivacyPage() {
    return (
        <div className="px-4 py-10 sm:px-6 sm:py-14">
            <article className="mx-auto grid max-w-3xl gap-8 rounded-xl border border-border bg-surface p-6 shadow-sm sm:p-8">
                <header className="grid gap-3">
                    <p className="text-sm font-semibold text-brand">الوضوح قبل المشاركة</p>
                    <h1 className="text-3xl font-bold text-foreground sm:text-4xl">مبادئ الخصوصية في سند</h1>
                    <p className="leading-8 text-muted-foreground">
                        توضح هذه الصفحة ما تعرضه تجربة الاستكشاف العامة، وما يبقى خارج الأسطح العامة في النسخة الحالية.
                    </p>
                </header>

                <section aria-labelledby="public-content-heading" className="grid gap-3">
                    <h2 id="public-content-heading" className="text-xl font-bold text-foreground">
                        المحتوى العام
                    </h2>
                    <p className="leading-8 text-muted-foreground">
                        يمكن للزوار قراءة المنشورات والتعليقات المتاحة للعامة دون تسجيل الدخول. ويظهر مع المحتوى العام اسم الكاتب وصورته الشخصية إن كانت متوفرة.
                    </p>
                </section>

                <section aria-labelledby="private-fields-heading" className="grid gap-3">
                    <h2 id="private-fields-heading" className="text-xl font-bold text-foreground">
                        البيانات غير المعروضة للعامة
                    </h2>
                    <p className="leading-8 text-muted-foreground">
                        لا تعرض صفحات المنشورات والتعليقات العامة البريد الإلكتروني أو حالة الحساب أو الصلاحيات أو أي حقول داخلية لإدارة الحساب.
                    </p>
                </section>

                <section aria-labelledby="interaction-heading" className="grid gap-3">
                    <h2 id="interaction-heading" className="text-xl font-bold text-foreground">
                        التفاعل والحساب
                    </h2>
                    <p className="leading-8 text-muted-foreground">
                        القراءة العامة متاحة للزائر. أما النشر والإعجاب والحفظ والتعليق والإبلاغ فتتطلب حسابًا نشطًا عند توفر تجربة المصادقة والتفاعل.
                    </p>
                </section>

                <section aria-labelledby="unavailable-heading" className="grid gap-3">
                    <h2 id="unavailable-heading" className="text-xl font-bold text-foreground">
                        المحتوى غير المتاح
                    </h2>
                    <p className="leading-8 text-muted-foreground">
                        عند عدم توفر منشور للعامة، تستخدم الواجهة رسالة موحدة ولا تكشف ما إذا كان المحتوى مفقودًا أو محذوفًا أو مخفيًا.
                    </p>
                </section>

                <div>
                    <Link href="/posts" className={cn(buttonVariants({variant: "secondary"}))}>
                        تصفح المنشورات العامة
                    </Link>
                </div>
            </article>
        </div>
    );
}
