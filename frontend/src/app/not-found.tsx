import Image from "next/image";
import Link from "next/link";

import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

export default function GlobalNotFound() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 sm:px-6">
            <div className="grid w-full max-w-xl justify-items-center gap-6 rounded-xl border border-border bg-surface p-6 text-center shadow-sm sm:p-10">
                <Image
                    src="/brand/snd-logo.png"
                    alt="شعار سند"
                    width={72}
                    height={72}
                    className="size-16 object-contain"
                />

                <div className="grid gap-3">
                    <p className="text-sm font-semibold text-brand">خطأ 404</p>
                    <h1 className="text-3xl font-bold text-foreground">الصفحة غير موجودة</h1>
                    <p className="leading-7 text-muted-foreground">
                        قد يكون الرابط غير صحيح أو أن الصفحة لم تعد متاحة. يمكنك العودة إلى الرئيسية أو متابعة تصفح المنشورات العامة.
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/" className={cn(buttonVariants())}>
                        العودة للرئيسية
                    </Link>
                    <Link href="/posts" className={cn(buttonVariants({variant: "secondary"}))}>
                        المنشورات العامة
                    </Link>
                </div>
            </div>
        </main>
    );
}
