"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Mail, UserRound} from "lucide-react";
import Link from "next/link";
import {useCallback, useState} from "react";
import {useForm} from "react-hook-form";

import type {SndToastContent} from "@/components/feeback/toast/snd-toast-store";

import {useAuth} from "../providers/auth-provider";
import {
    registerInputSchema,
    type AuthSessionData,
    type RegisterFormValues,
    type RegisterPayload,
} from "../schemas/auth.schema";
import type {AuthErrorPresentation} from "../errors/auth-error-mapper";
import {useAuthFormSubmit} from "../hooks/use-auth-form-submit";
import {AuthPasswordField, AuthTextField} from "../components/auth-form-field";
import {AuthFormAlert} from "../components/auth-form-alert";
import {AuthSubmitButton} from "../components/auth-submit-button";

const registerLoadingToast: SndToastContent = {
    title: "ننشئ مساحتك في سند",
    description: "نتحقق من البيانات ونجهّز حسابك الأول.",
};

function createRegisterSuccessToast(session: AuthSessionData): SndToastContent {
    return {
        title: `مرحبًا بك في سند، ${session.user.name}`,
        description: "تم إنشاء الحساب وتسجيل دخولك بنجاح.",
    };
}

export function RegisterForm() {
    const {register: createAccount} = useAuth();

    const [submissionError, setSubmissionError] = useState<AuthErrorPresentation | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: {errors},
    } = useForm<RegisterFormValues, unknown, RegisterPayload>({
        resolver: zodResolver(registerInputSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        },
        mode: "onSubmit",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        shouldFocusError: true,
    });

    const handleStart = useCallback(() => {
        clearErrors();
        setSubmissionError(null);
    }, [clearErrors]);

    const handleMappedError = useCallback(
        (presentation: AuthErrorPresentation) => {
            setSubmissionError(presentation);

            const fieldOrder = ["name", "email", "password"] as const;

            let shouldFocus = true;

            for (const field of fieldOrder) {
                const message = presentation.fieldErrors[field];

                if (!message) {
                    continue;
                }

                setError(
                    field,
                    {
                        type: "server",
                        message,
                    },
                    {
                        shouldFocus,
                    }
                );

                shouldFocus = false;
            }
        },
        [setError]
    );

    const {submit, retry, isPending, isSuccess} = useAuthFormSubmit<RegisterPayload>({
        operation: "register",
        mutationKey: ["auth", "register"],

        execute: (values, options) => createAccount(values, options),

        loadingToast: registerLoadingToast,

        successToast: createRegisterSuccessToast,

        onStart: handleStart,
        onError: handleMappedError,
    });

    const disabled = isPending || isSuccess;

    return (
        <form noValidate aria-busy={isPending} onSubmit={handleSubmit(submit)} className="grid gap-5">
            {submissionError ? (
                <AuthFormAlert
                    title={submissionError.title}
                    message={submissionError.formMessage}
                    tone={submissionError.tone}
                    requestId={submissionError.requestId}
                    actionLabel={submissionError.retryable ? "إعادة المحاولة" : undefined}
                    onAction={submissionError.retryable ? retry : undefined}
                    actionDisabled={isPending}
                />
            ) : null}

            <AuthTextField
                {...register("name")}
                type="text"
                autoComplete="name"
                icon={UserRound}
                label="الاسم"
                placeholder="الاسم الذي سيظهر في سند"
                required
                disabled={disabled}
                error={errors.name?.message}
            />

            <AuthTextField
                {...register("email")}
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                icon={Mail}
                label="البريد الإلكتروني"
                placeholder="name@example.com"
                required
                disabled={disabled}
                error={errors.email?.message}
            />

            <AuthPasswordField
                {...register("password")}
                autoComplete="new-password"
                label="كلمة المرور"
                placeholder="أنشئ كلمة مرور"
                description="استخدم من 8 إلى 72 حرفًا."
                required
                disabled={disabled}
                error={errors.password?.message}
            />

            <p className="text-xs leading-6 text-muted-foreground">
                قبل إنشاء الحساب، راجع{" "}
                <Link href="/community-guidelines" className="font-bold text-brand underline-offset-4 hover:underline">
                    إرشادات المجتمع
                </Link>{" "}
                و
                <Link href="/privacy" className="font-bold text-brand underline-offset-4 hover:underline">
                    سياسة الخصوصية
                </Link>
                .
            </p>

            <AuthSubmitButton
                label="إنشاء الحساب"
                pendingLabel="جار إنشاء الحساب"
                successLabel="تم إنشاء حسابك"
                pending={isPending}
                success={isSuccess}
            />
        </form>
    );
}
