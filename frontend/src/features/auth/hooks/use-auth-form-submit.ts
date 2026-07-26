"use client";

import {useMutation, type MutationKey} from "@tanstack/react-query";
import {useCallback, useEffect, useRef} from "react";

import {sndToast, type SndToastContent} from "@/components/feeback/toast/snd-toast-store";

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

    lastSubmittedValues: TValues | null;
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
                    action: presentation.retryable
                        ? {
                              label: "إعادة المحاولة",
                              onClick: () => {
                                  const lastValues = lastSubmittedValuesRef.current;

                                  if (lastValues) {
                                      void submitRef.current(lastValues);
                                  }
                              },
                          }
                        : undefined,
                });
            }
        },
        [loadingToast, mutation, onError, onStart, operation, successToast]
    );

    // eslint-disable-next-line react-hooks/refs
    submitRef.current = submit;

    const retry = useCallback(() => {
        const lastValues = lastSubmittedValuesRef.current;

        if (!lastValues) {
            return;
        }

        void submitRef.current(lastValues);
    }, []);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
            activeAbortControllerRef.current?.abort();
        };
    }, []);

    return {
        submit,
        retry,
        isPending: mutation.isPending,
        isSuccess: mutation.isSuccess,
        // eslint-disable-next-line react-hooks/refs
        lastSubmittedValues: lastSubmittedValuesRef.current,
    };
}
