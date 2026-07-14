import Image from "next/image";

import {ThemeToggle} from "@/components/theme/theme-toggle";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {Feedback} from "@/components/ui/feedback";
import {Field} from "@/components/ui/field";
import {Input} from "@/components/ui/input";

export default function HomePage() {
    return (
        <main className="min-h-dvh bg-background px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto grid max-w-5xl gap-8">
                <header className="flex flex-col gap-5 rounded-xl border border-border bg-surface-raised p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Image
                            src="/brand/snd-logo.png"
                            alt="شعار سند"
                            width={72}
                            height={72}
                            priority
                            className="size-16 shrink-0 object-contain"
                        />
                        <div className="grid gap-1">
                            <p className="text-sm font-semibold text-brand">سند · SND</p>
                            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">معرض أساس الواجهة</h1>
                            <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                                صفحة مؤقتة للتحقق من الهوية، والاتجاه العربي، والمكوّنات المشتركة قبل بدء صفحات المنتج في Sprint F2.
                            </p>
                        </div>
                    </div>
                    <ThemeToggle />
                </header>

                <section aria-labelledby="components-heading" className="grid gap-5 lg:grid-cols-2">
                    <h2 id="components-heading" className="sr-only">
                        المكوّنات الأساسية
                    </h2>

                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold">الأزرار الدلالية</h3>
                            <p className="text-sm leading-6 text-muted-foreground">
                                الشكل يعبّر عن مسؤولية الإجراء، وليس عن لون ثابت داخل كل صفحة.
                            </p>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <Button type="button">إجراء أساسي</Button>
                            <Button type="button" variant="secondary">
                                إجراء ثانوي
                            </Button>
                            <Button type="button" variant="ghost">
                                إجراء هادئ
                            </Button>
                            <Button type="button" variant="danger">
                                إجراء خطِر
                            </Button>
                        </CardContent>
                        <CardFooter>
                            <p className="text-sm text-muted-foreground">جميع الأزرار تحافظ على هدف لمس مناسب وFocus ظاهر.</p>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="text-lg font-bold">الحقل ورسائل المساعدة</h3>
                            <p className="text-sm leading-6 text-muted-foreground">
                                الـ Label والوصف والخطأ تبقى معلومات منفصلة ومرتبطة بالحقل دلاليًا.
                            </p>
                        </CardHeader>
                        <CardContent>
                            <Field
                                htmlFor="foundation-example"
                                label="عنوان تجريبي"
                                description="هذا مثال بصري فقط ولا يرسل أي بيانات."
                            >
                                <Input
                                    id="foundation-example"
                                    name="foundation-example"
                                    placeholder="اكتب عنوانًا تجريبيًا"
                                    aria-describedby="foundation-example-description"
                                />
                            </Field>
                        </CardContent>
                    </Card>
                </section>

                <Feedback
                    role="note"
                    title="أساس Sprint F1 جاهز للمراجعة النهائية"
                    description="هذه الصفحة ليست Landing Page النهائية، ولا تضيف ادعاءات أو ميزات غير موجودة في عقد المنتج."
                />
            </div>
        </main>
    );
}
