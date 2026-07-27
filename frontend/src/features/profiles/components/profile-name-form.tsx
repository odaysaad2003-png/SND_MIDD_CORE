"use client";

import {zodResolver} from "@hookform/resolvers/zod";
import {LoaderCircle, RotateCcw, Save, UserRound} from "lucide-react";
import {useId, useState, type ChangeEvent} from "react";
import {useForm} from "react-hook-form";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Button} from "@/components/ui/button";
import {Feedback} from "@/components/ui/feedback";
import {Input} from "@/components/ui/input";
import {useAuth} from "@/features/auth/providers/auth-provider";

import {
    isProfileUpdateAbortError,
    mapProfileUpdateError,
    type ProfileUpdateErrorPresentation,
} from "../errors/profile-update-error-mapper";
import {useUpdateMyProfile} from "../hooks/use-update-my-profile";
import {
    updateMyProfileInputSchema,
    type MyProfile,
    type UpdateMyProfileFormValues,
    type UpdateMyProfilePayload,
} from "../schemas/my-profile.schema";

type ProfileNameFormProps = Readonly<{
    profile: MyProfile;
}>;

export function ProfileNameForm({profile}: ProfileNameFormProps) {
    const nameInputId = useId();
    const nameHelpId = `${nameInputId}-help`;
    const nameErrorId = `${nameInputId}-error`;

    const [submissionError, setSubmissionError] = useState<ProfileUpdateErrorPresentation | null>(null);

    const {updateCurrentUserIdentity} = useAuth();

    const {
        mutateAsync: updateProfile,
        isPending,
        reset: resetMutation,
    } = useUpdateMyProfile({
        onIdentityUpdated: updateCurrentUserIdentity,
    });

    const {
        register,
        handleSubmit,
        watch,
        reset,
        setError,
        clearErrors,
        formState: {errors},
    } = useForm<UpdateMyProfileFormValues, unknown, UpdateMyProfilePayload>({
        resolver: zodResolver(updateMyProfileInputSchema),

        defaultValues: {
            name: profile.name,
        },

        mode: "onSubmit",
        reValidateMode: "onChange",
        criteriaMode: "firstError",
        shouldFocusError: true,
    });

    const currentName = watch("name");

    const normalizedCurrentName = currentName.trim();

    const hasMeaningfulChange = normalizedCurrentName !== profile.name;

    const nameLength = currentName.length;

    const {onChange: registerNameChange, ...nameField} = register("name");

    function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
        void registerNameChange(event);

        clearErrors("name");
        setSubmissionError(null);
        resetMutation();
    }

    function resetForm(): void {
        reset({
            name: profile.name,
        });

        setSubmissionError(null);
        clearErrors();
        resetMutation();
    }

    async function submitName(values: UpdateMyProfilePayload): Promise<void> {
        setSubmissionError(null);
        clearErrors();

        const toastId = sndToast.loading({
            title: "جار حفظ الاسم",
            description: "نحدّث بيانات ملفك الشخصي الآن.",
            dismissible: false,
        });

        try {
            const updatedProfile = await updateProfile(values);

            reset({
                name: updatedProfile.name,
            });

            sndToast.success({
                id: toastId,
                title: "تم تحديث الاسم",
                description: "ظهر الاسم الجديد في ملفك الشخصي وفي رأس الموقع.",
            });
        } catch (error) {
            if (isProfileUpdateAbortError(error)) {
                sndToast.dismiss(toastId);
                return;
            }

            const presentation = mapProfileUpdateError(error);

            setSubmissionError(presentation);

            if (presentation.fieldMessage) {
                setError(
                    "name",
                    {
                        type: "server",
                        message: presentation.fieldMessage,
                    },
                    {
                        shouldFocus: true,
                    }
                );
            }

            sndToast.error({
                id: toastId,
                title: presentation.title,
                description: presentation.description,
                durationMs: presentation.toastDurationMs,
            });
        }
    }

    function retrySubmission(): void {
        void handleSubmit(submitName)();
    }

    const describedBy = errors.name ? `${nameHelpId} ${nameErrorId}` : nameHelpId;

    return (
        <section
            id="profile-name"
            aria-labelledby="profile-name-heading"
            className="scroll-mt-28 rounded-3xl border border-border bg-surface-raised p-5 shadow-sm sm:p-6"
        >
            <div className="grid gap-5">
                <header className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-brand/10 text-brand">
                        <UserRound aria-hidden="true" className="size-5" />
                    </span>

                    <div>
                        <h2 id="profile-name-heading" className="text-lg font-bold text-foreground">
                            الاسم الظاهر
                        </h2>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            هذا الاسم يظهر في حسابك ومنشوراتك وتعليقاتك داخل سند.
                        </p>
                    </div>
                </header>

                {submissionError ? (
                    <Feedback
                        variant={submissionError.tone}
                        title={submissionError.title}
                        description={
                            <div className="grid gap-3">
                                <p>{submissionError.description}</p>

                                {submissionError.requestId ? (
                                    <p className="text-xs">
                                        رقم الطلب:{" "}
                                        <code dir="ltr" className="font-mono">
                                            {submissionError.requestId}
                                        </code>
                                    </p>
                                ) : null}

                                {submissionError.retryable ? (
                                    <div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            disabled={isPending}
                                            onClick={retrySubmission}
                                        >
                                            <RotateCcw aria-hidden="true" />
                                            إعادة المحاولة
                                        </Button>
                                    </div>
                                ) : null}
                            </div>
                        }
                    />
                ) : null}

                <form noValidate aria-busy={isPending} onSubmit={handleSubmit(submitName)} className="grid gap-4">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3">
                            <label htmlFor={nameInputId} className="text-sm font-bold text-foreground">
                                الاسم
                            </label>

                            <span className="text-xs text-muted-foreground">{nameLength}/100</span>
                        </div>

                        <Input
                            {...nameField}
                            id={nameInputId}
                            type="text"
                            autoComplete="name"
                            maxLength={100}
                            disabled={isPending}
                            aria-invalid={errors.name ? true : undefined}
                            aria-describedby={describedBy}
                            onChange={handleNameChange}
                            className="h-12"
                        />

                        <p id={nameHelpId} className="text-xs leading-5 text-muted-foreground">
                            استخدم الاسم الذي تريد أن يتعرّف به مجتمع سند عليك.
                        </p>

                        {errors.name?.message ? (
                            <p id={nameErrorId} role="alert" className="text-sm font-medium text-danger">
                                {errors.name.message}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isPending || !hasMeaningfulChange}
                            onClick={resetForm}
                        >
                            <RotateCcw aria-hidden="true" />
                            التراجع عن التغييرات
                        </Button>

                        <Button type="submit" disabled={isPending || !hasMeaningfulChange} aria-busy={isPending}>
                            {isPending ? (
                                <LoaderCircle aria-hidden="true" className="motion-safe:animate-spin" />
                            ) : (
                                <Save aria-hidden="true" />
                            )}

                            {isPending ? "جار الحفظ" : "حفظ الاسم"}
                        </Button>
                    </div>
                </form>
            </div>
        </section>
    );
}
