import Link from "next/link";

import {buttonVariants} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {cn} from "@/lib/utils/cn";

export default function PublicPostNotFound() {
    return (
        <div className="px-4 py-14 sm:px-6 sm:py-20">
            <div className="mx-auto grid max-w-2xl gap-5">
                <Feedback
                    variant="warning"
                    title="المنشور غير متاح"
                    description={
                        <div className="grid gap-4">
                            <p>
                                قد يكون الرابط غير صحيح أو أن المنشور لم يعد متاحًا للعامة. لا يمكننا عرض تفاصيل إضافية عن سبب عدم توفره.
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href="/posts"
                                    className={cn(buttonVariants({variant: "secondary"}))}
                                >
                                    تصفح المنشورات العامة
                                </Link>
                                <Link href="/" className={cn(buttonVariants({variant: "ghost"}))}>
                                    العودة للرئيسية
                                </Link>
                            </div>
                        </div>
                    }
                />
            </div>
        </div>
    );
}
