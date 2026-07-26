"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {Mail} from "lucide-react";
import Link from "next/link";
import {useCallback, useState} from "react";
import {useForm} from "react-hook-form";

import type {SndToastContent} from "@/components/feedback/toast/snd-toast-store";

import {useAuth} from "../providers/auth-provider";
import {loginInputSchema, type AuthSessionData, type LoginFormValues, type LoginPayload} from "../schemas/auth.schema";
import {type AuthErrorPresentation} from "../errors/auth-error-mapper";
import {useAuthFormSubmit} from "../hooks/use-auth-form-submit";
import {AuthPasswordField, AuthTextField} from "../components/auth-form-field";
import {AuthFormAlert} from "../components/auth-form-alert";
import {AuthSubmitButton} from "../components/auth-submit-button";

const loginLoadingToast: SndToastContent = {
    title: "نفتح جلستك الآن",
    description: "نتحقق من البيانات ونجهّز مساحتك في سند.",
};

function createLoginSuccessToast(session: AuthSessionData): SndToastContent {
    return {
        title: `أهلًا بعودتك، ${session.user.name}`,
        description: "تم تسجيل الدخول بنجاح، جار نقلك إلى وجهتك.",
    };
}

export function LoginForm() {
    const {login} = useAuth();

    const [submissionError, setSubmissionError] = useState<AuthErrorPresentation | null>(null);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: {errors},
    } = useForm<LoginFormValues, unknown, LoginPayload>({
        resolver: zodResolver(loginInputSchema),
        defaultValues: {
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

            const fieldOrder = ["email", "password"] as const;

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

    const {submit, retry, isPending, isSuccess} = useAuthFormSubmit<LoginPayload>({
        operation: "login",
        mutationKey: ["auth", "login"],

        execute: (values, options) => login(values, options),

        loadingToast: loginLoadingToast,
        successToast: createLoginSuccessToast,

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
                autoComplete="current-password"
                enterKeyHint="go"
                label="كلمة المرور"
                placeholder="أدخل كلمة المرور"
                required
                disabled={disabled}
                error={errors.password?.message}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">يمكنك الدخول ومتابعة تفاعلاتك</span>

                <Link
                    href="/posts"
                    className="rounded-lg px-2 py-1.5 font-bold text-brand transition-colors hover:bg-brand/8"
                >
                    التصفح دون تسجيل
                </Link>
            </div>

            <AuthSubmitButton
                label="تسجيل الدخول"
                pendingLabel="جار تسجيل الدخول"
                successLabel="تم تسجيل الدخول"
                pending={isPending}
                success={isSuccess}
            />
        </form>
    );
}
