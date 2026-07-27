"use client";

import {AlertTriangle, Inbox, LoaderCircle, RefreshCw, SearchX} from "lucide-react";
import Link from "next/link";
import {useEffect, useState, type ReactNode} from "react";

import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {ModalDialog} from "@/components/ui/modal-dialog";
import {Textarea} from "@/components/ui/textarea";
import {cn} from "@/lib/utils/cn";

import type {AdminErrorContent} from "../lib/admin-display";
import type {AdminPaginationMeta} from "../schemas/admin.schema";

export function buildAdminFilterHrefFromForm(path: string, form: HTMLFormElement): string {
    const searchParams = new URLSearchParams();

    new FormData(form).forEach((value, key) => {
        if (typeof value === "string" && value.trim() !== "") {
            searchParams.set(key, value.trim());
        }
    });

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
}

type AdminPageHeaderProps = Readonly<{
    eyebrow: string;
    title: string;
    description: string;
    actions?: ReactNode;
}>;

export function AdminPageHeader({eyebrow, title, description, actions}: AdminPageHeaderProps) {
    return (
        <header className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-raised p-5 sm:p-7">
            <div aria-hidden="true" className="absolute -end-20 -top-28 size-72 rounded-full bg-brand/10 blur-3xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="grid max-w-3xl gap-2">
                    <p className="text-xs font-bold text-brand">{eyebrow}</p>
                    <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">{title}</h2>
                    <p className="max-w-2xl leading-7 text-muted-foreground">{description}</p>
                </div>
                {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
            </div>
        </header>
    );
}

type AdminBadgeTone = "brand" | "success" | "warning" | "danger" | "info" | "muted";

const badgeStyles: Record<AdminBadgeTone, string> = {
    brand: "border-brand/20 bg-brand/10 text-brand",
    success: "border-success/25 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/12 text-foreground",
    danger: "border-danger/25 bg-danger/10 text-danger",
    info: "border-info/25 bg-info/10 text-info",
    muted: "border-border bg-surface-muted text-muted-foreground",
};

export function AdminBadge({
    children,
    tone = "muted",
    className,
}: Readonly<{
    children: ReactNode;
    tone?: AdminBadgeTone;
    className?: string;
}>) {
    return (
        <span
            className={cn(
                "inline-flex min-h-7 items-center rounded-full border px-2.5 py-1 text-xs font-bold",
                badgeStyles[tone],
                className
            )}
        >
            {children}
        </span>
    );
}

export function AdminPageSkeleton({cards = 6}: Readonly<{cards?: number}>) {
    return (
        <div role="status" aria-label="جار تحميل بيانات الإدارة" className="grid gap-5">
            <div className="skeleton-block h-44 rounded-[2rem]" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({length: cards}, (_, index) => (
                    <div key={index} className="rounded-2xl border border-border bg-surface p-5">
                        <div className="skeleton-block h-5 w-2/3 rounded-lg" />
                        <div className="skeleton-block mt-5 h-9 w-1/3 rounded-lg" />
                        <div className="skeleton-block mt-5 h-4 w-full rounded-lg" />
                    </div>
                ))}
            </div>
            <span className="sr-only">جار تحميل البيانات…</span>
        </div>
    );
}

export function AdminDetailSkeleton() {
    return (
        <div role="status" aria-label="جار تحميل التفاصيل" className="grid gap-4">
            <div className="skeleton-block h-20 rounded-2xl" />
            <div className="skeleton-block h-32 rounded-2xl" />
            <div className="skeleton-block h-24 rounded-2xl" />
        </div>
    );
}

export function AdminErrorState({
    content,
    isRetrying,
    onRetry,
}: Readonly<{
    content: AdminErrorContent;
    isRetrying?: boolean;
    onRetry: () => void;
}>) {
    return (
        <Feedback
            variant={content.isForbidden ? "warning" : "danger"}
            title={content.title}
            description={
                <div className="grid gap-4">
                    <p>{content.description}</p>
                    {content.requestId ? (
                        <p className="text-xs text-muted-foreground">
                            معرّف الطلب: <code dir="ltr">{content.requestId}</code>
                        </p>
                    ) : null}
                    <div>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={isRetrying}
                            aria-busy={isRetrying}
                            onClick={onRetry}
                        >
                            <RefreshCw
                                aria-hidden="true"
                                className={isRetrying ? "motion-safe:animate-spin" : undefined}
                            />
                            {isRetrying ? "جار إعادة المحاولة" : "إعادة المحاولة"}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}

export function AdminEmptyState({
    filtered,
    title,
    description,
    resetHref,
    actionLabel = "مسح الفلاتر",
}: Readonly<{
    filtered: boolean;
    title: string;
    description: string;
    resetHref?: string;
    actionLabel?: string;
}>) {
    const Icon = filtered ? SearchX : Inbox;

    return (
        <section className="rounded-[2rem] border border-dashed border-border-strong bg-surface p-7 text-center sm:p-10">
            <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-brand/10 text-brand">
                <Icon aria-hidden="true" className="size-8" />
            </span>
            <h3 className="mt-5 text-2xl font-bold text-foreground">{title}</h3>
            <p className="mx-auto mt-2 max-w-xl leading-7 text-muted-foreground">{description}</p>
            {filtered && resetHref ? (
                <Button asChild variant="secondary" className="mt-5">
                    <Link href={resetHref}>{actionLabel}</Link>
                </Button>
            ) : null}
        </section>
    );
}

export function AdminPagination({
    meta,
    buildHref,
}: Readonly<{
    meta: AdminPaginationMeta;
    buildHref: (page: number) => string;
}>) {
    if (meta.totalPages <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="التنقل بين صفحات النتائج الإدارية"
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4"
        >
            <Button asChild={meta.page > 1} variant="secondary" disabled={meta.page <= 1}>
                {meta.page > 1 ? <Link href={buildHref(meta.page - 1)}>الصفحة السابقة</Link> : "الصفحة السابقة"}
            </Button>

            <p className="text-sm text-muted-foreground">
                الصفحة <strong className="text-foreground">{meta.page}</strong> من{" "}
                <strong className="text-foreground">{meta.totalPages}</strong>
            </p>

            <Button asChild={meta.page < meta.totalPages} variant="secondary" disabled={meta.page >= meta.totalPages}>
                {meta.page < meta.totalPages ? <Link href={buildHref(meta.page + 1)}>الصفحة التالية</Link> : "الصفحة التالية"}
            </Button>
        </nav>
    );
}

type AdminActionDialogProps = Readonly<{
    open: boolean;
    title: string;
    description: ReactNode;
    inputLabel: string;
    inputPlaceholder: string;
    confirmLabel: string;
    pendingLabel: string;
    isPending: boolean;
    minLength?: number;
    maxLength: number;
    optional?: boolean;
    danger?: boolean;
    serverError?: string | null;
    onConfirm: (value: string) => void;
    onOpenChange: (open: boolean) => void;
}>;

export function AdminActionDialog({
    open,
    title,
    description,
    inputLabel,
    inputPlaceholder,
    confirmLabel,
    pendingLabel,
    isPending,
    minLength = 0,
    maxLength,
    optional = false,
    danger = false,
    serverError,
    onConfirm,
    onOpenChange,
}: AdminActionDialogProps) {
    const [value, setValue] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setValue("");
            setValidationError(null);
        }
    }, [open]);

    function confirm(): void {
        const normalized = value.trim();

        if (!optional && normalized.length < minLength) {
            setValidationError(`اكتب ${minLength} أحرف على الأقل قبل تأكيد الإجراء.`);
            return;
        }

        if (normalized.length > maxLength) {
            setValidationError(`النص يجب ألا يتجاوز ${maxLength} حرفًا.`);
            return;
        }

        setValidationError(null);
        onConfirm(normalized);
    }

    return (
        <ModalDialog
            open={open}
            title={title}
            description={typeof description === "string" ? description : undefined}
            isBusy={isPending}
            onOpenChange={onOpenChange}
            footer={
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => onOpenChange(false)}
                    >
                        إلغاء
                    </Button>
                    <Button
                        type="button"
                        variant={danger ? "danger" : "primary"}
                        disabled={isPending}
                        aria-busy={isPending}
                        onClick={confirm}
                    >
                        {isPending ? <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" /> : null}
                        {isPending ? pendingLabel : confirmLabel}
                    </Button>
                </div>
            }
        >
            <div className="grid gap-5">
                {typeof description !== "string" ? (
                    <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 leading-7 text-foreground">
                        {description}
                    </div>
                ) : null}

                <div className="grid gap-2">
                    <label htmlFor="admin-action-note" className="text-sm font-bold text-foreground">
                        {inputLabel} {optional ? <span className="font-normal text-muted-foreground">(اختياري)</span> : null}
                    </label>
                    <Textarea
                        id="admin-action-note"
                        value={value}
                        maxLength={maxLength}
                        rows={5}
                        disabled={isPending}
                        aria-invalid={Boolean(validationError || serverError)}
                        aria-describedby={validationError || serverError ? "admin-action-error" : "admin-action-count"}
                        placeholder={inputPlaceholder}
                        onChange={(event) => {
                            setValue(event.target.value);
                            setValidationError(null);
                        }}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <p id="admin-action-count" className="text-muted-foreground">
                            {value.length} / {maxLength}
                        </p>
                        {validationError || serverError ? (
                            <p id="admin-action-error" role="alert" className="font-semibold text-danger">
                                {validationError ?? serverError}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="flex gap-3 rounded-2xl border border-border bg-surface-muted/60 p-4 text-sm leading-6 text-muted-foreground">
                    <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-warning" />
                    لا تُحدّث الواجهة الحالة بشكل متفائل. سيظهر التغيير فقط بعد تأكيد الخادم.
                </div>
            </div>
        </ModalDialog>
    );
}
