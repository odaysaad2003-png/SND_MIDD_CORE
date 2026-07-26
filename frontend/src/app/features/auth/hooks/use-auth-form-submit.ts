"use client";

import {useMutation, type MutationKey} from "@tanstack/react-query";
import {useCallback, useEffect, useRef} from "react";

import {sndToast, type SndToastContent} from "@/components/feedback/toast/snd-toast-store";

import {
    isAuthAbortError,
    mapAuthMutationError,
    type AuthErrorPresentation,
    type AuthOperation,
} from "../errors/auth-error-mapper";
import type {AuthSessionData} from "../schemas/auth.schema";

type AuthExecutionOptions = Readonly<{
    signal: AbortSignal;
}>;

type UseAuthFormSubmitOptions<TValues> = Readonly<{
    operation: AuthOperation;
    mutationKey: MutationKey;

    execute: (values: TValues, options: AuthExecutionOptions) => Promise<AuthSessionData>;

    loadingToast: SndToastContent;

    successToast: (session: AuthSessionData) => SndToastContent;

    onStart: () => void;

    onError: (presentation: AuthErrorPresentation) => void;
}>;

type UseAuthFormSubmitResult<TValues> = Readonly<{
    submit: (values: TValues) => Promise<void>;

    retry: () => void;

    isPending: boolean;
    isSuccess: boolean;
}>;

export function useAuthFormSubmit<TValues>({
    operation,
    mutationKey,
    execute,
    loadingToast,
    successToast,
    onStart,
    onError,
}: UseAuthFormSubmitOptions<TValues>): UseAuthFormSubmitResult<TValues> {
    const activeAbortControllerRef = useRef<AbortController | null>(null);

    const lastSubmittedValuesRef = useRef<TValues | null>(null);

    const isMountedRef = useRef(true);

    const submitRef = useRef<(values: TValues) => Promise<void>>(async () => undefined);

    const mutation = useMutation<AuthSessionData, unknown, TValues>({
        mutationKey,
        retry: false,

        mutationFn: async (values) => {
            activeAbortControllerRef.current?.abort();

            const abortController = new AbortController();

            activeAbortControllerRef.current = abortController;

            try {
                return await execute(values, {
                    signal: abortController.signal,
                });
            } finally {
                if (activeAbortControllerRef.current === abortController) {
                    activeAbortControllerRef.current = null;
                }
            }
        },
    });

    const submit = useCallback(
        async (values: TValues): Promise<void> => {
            lastSubmittedValuesRef.current = values;

            onStart();

            const toastId = sndToast.loading({
                ...loadingToast,
                dismissible: false,
                durationMs: 0,
            });

            try {
                const session = await mutation.mutateAsync(values);

                sndToast.success({
                    ...successToast(session),
                    id: toastId,
                });
            } catch (error) {
                if (isAuthAbortError(error)) {
                    sndToast.dismiss(toastId);
                    return;
                }

                const presentation = mapAuthMutationError(error, operation);

                if (isMountedRef.current) {
                    onError(presentation);
                }

                sndToast.error({
                    id: toastId,
                    title: presentation.title,
                    description: presentation.description,
                    durationMs: presentation.toastDurationMs,
                });
            }
        },
        [loadingToast, mutation, onError, onStart, operation, successToast]
    );

    useEffect(() => {
        submitRef.current = submit;
    }, [submit]);

    const retry = useCallback(() => {
        const lastValues = lastSubmittedValuesRef.current;

        if (!lastValues) {
            return;
        }

        void submitRef.current(lastValues);
    }, []);

    useEffect(() => {
        /*
         * React Strict Mode يعيد تشغيل دورة الـEffect في التطوير.
         * لذلك نعيد تثبيت القيمة هنا بدل الاعتماد على التهيئة الأولى فقط.
         */
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
            activeAbortControllerRef.current?.abort();
            activeAbortControllerRef.current = null;

            /*
             * لا نُبقي مرجعًا عالميًا أو طويل العمر لبيانات الدخول.
             * إعادة المحاولة تبقى داخل عمر النموذج فقط.
             */
            lastSubmittedValuesRef.current = null;
        };
    }, []);

    return {
        submit,
        retry,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
    };
}
