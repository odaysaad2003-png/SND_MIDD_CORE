import {FileText, LockKeyhole, ShieldCheck, UserRound} from "lucide-react";
import Link from "next/link";

import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

import {MyProfileClient} from "../components/my-profile-client";

export function MyProfilePage() {
    return (
        <div className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-8">
                <header className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-raised p-6 sm:p-9">
                    <div
                        aria-hidden="true"
                        className="absolute -end-16 -top-24 size-72 rounded-full bg-brand/12 blur-3xl"
                    />

                    <div
                        aria-hidden="true"
                        className="absolute -bottom-24 -start-20 size-64 rounded-full bg-info/8 blur-3xl"
                    />

                    <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div className="grid max-w-3xl gap-4">
                            <p className="section-kicker">
                                <UserRound aria-hidden="true" className="me-1.5 inline size-3.5" />
                                حسابك في سند
                            </p>

                            <div className="grid gap-4">
                                <div className="grid gap-3">
                                    <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                                        ملفك الشخصي الخاص
                                    </h1>

                                    <p className="max-w-2xl leading-8 text-muted-foreground">
                                        راجع بيانات حسابك وهويتك المستخدمة داخل سند. البريد الإلكتروني وحالة الحساب لا
                                        يظهران في صفحات المجتمع العامة.
                                    </p>
                                </div>

                                <div>
                                    <Link
                                        href="/my-posts"
                                        className={cn(buttonVariants({variant: "secondary"}), "w-full sm:w-auto")}
                                    >
                                        <FileText aria-hidden="true" />
                                        إدارة منشوراتي
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
                                <LockKeyhole aria-hidden="true" className="size-3.5 text-brand" />
                                مساحة خاصة
                            </span>

                            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2">
                                <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
                                جلسة محمية
                            </span>
                        </div>
                    </div>
                </header>

                <MyProfileClient />
            </div>
        </div>
    );
}
