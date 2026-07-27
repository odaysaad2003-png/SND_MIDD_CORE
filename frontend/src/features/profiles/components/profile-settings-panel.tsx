import {Camera, Mail, PencilLine, ShieldCheck} from "lucide-react";
import Link from "next/link";

import {Avatar} from "@/components/ui/avatar";
import {buttonVariants} from "@/components/ui/button";
import {cn} from "@/lib/utils/cn";

import type {MyProfile} from "../schemas/my-profile.schema";
import {ProfileAvatarSection} from "./profile-avatar-section";
import {ProfileNameForm} from "./profile-name-form";

type ProfileSettingsPanelProps = Readonly<{
    profile: MyProfile;
}>;

export function ProfileSettingsPanel({profile}: ProfileSettingsPanelProps) {
    return (
        <div id="profile-settings" className="grid gap-6">
            <section
                aria-labelledby="profile-summary-heading"
                className="overflow-hidden rounded-[2rem] border border-brand/15 bg-surface-raised shadow-sm"
            >
                <div className="bg-gradient-to-l from-brand/12 via-brand/5 to-transparent px-5 py-7 sm:px-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                        <Avatar
                            name={profile.name}
                            imageUrl={profile.avatar}
                            sizes="96px"
                            className="size-24 border-4 border-background text-2xl shadow-lg ring-2 ring-brand/15"
                        />

                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-brand">ملفك الشخصي في سند</p>

                            <h1
                                id="profile-summary-heading"
                                className="mt-1 truncate text-2xl font-black text-foreground sm:text-3xl"
                            >
                                {profile.name}
                            </h1>

                            <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                                <Mail aria-hidden="true" className="size-4 shrink-0" />

                                <span dir="ltr" title={profile.email} className="truncate text-left">
                                    {profile.email}
                                </span>
                            </div>

                            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-bold text-success">
                                <ShieldCheck aria-hidden="true" className="size-4" />
                                حساب نشط
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 border-t border-border p-5 sm:p-6">
                    <div>
                        <h2 className="font-bold text-foreground">إدارة الحساب</h2>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            يمكنك حاليًا تعديل الاسم الظاهر وصورة الحساب. البريد الإلكتروني غير قابل للتعديل ضمن العقد
                            الحالي.
                        </p>
                    </div>

                    <nav aria-label="اختصارات تعديل الحساب" className="flex flex-wrap gap-3">
                        <Link
                            href="#profile-name"
                            className={cn(
                                buttonVariants({
                                    variant: "secondary",
                                    size: "sm",
                                })
                            )}
                        >
                            <PencilLine aria-hidden="true" />
                            تعديل الاسم
                        </Link>

                        <Link
                            href="#profile-avatar"
                            className={cn(
                                buttonVariants({
                                    variant: "secondary",
                                    size: "sm",
                                })
                            )}
                        >
                            <Camera aria-hidden="true" />
                            تغيير الصورة
                        </Link>
                    </nav>
                </div>
            </section>

            <div className="grid items-start gap-6 xl:grid-cols-2">
                <ProfileNameForm profile={profile} />

                <ProfileAvatarSection profile={profile} />
            </div>
        </div>
    );
}
