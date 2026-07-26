"use client";

import Link from "next/link";

import {Button, buttonVariants} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {cn} from "@/lib/utils/cn";

type PublicPostErrorProps = Readonly<{
    error: Error & {
        digest?: string;
    };
    reset: () => void;
}>;

export default function PublicPostError({error, reset}: PublicPostErrorProps) {
    return (
        <div className="px-4 py-14 sm:px-6 sm:py-20">
            <div className="mx-auto grid max-w-2xl gap-5">
                <Feedback
                    variant="danger"
                    title="حدث خطأ غير متوقع في صفحة المنشور"
                    description={
                        <div className="grid gap-4">
                            <p>تعذر إكمال عرض الصفحة. أعد المحاولة، وإن استمرت المشكلة فارجع إلى المنشورات العامة.</p>

                            {error.digest ? (
                                <p className="text-xs text-muted-foreground">
                                    معرّف الخطأ: <code dir="ltr">{error.digest}</code>
                                </p>
                            ) : null}

                            <div className="flex flex-wrap gap-3">
                                <Button type="button" variant="secondary" onClick={reset}>
                                    إعادة المحاولة
                                </Button>
                                <Link href="/posts" className={cn(buttonVariants({variant: "ghost"}))}>
                                    العودة للمنشورات
                                </Link>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
}
