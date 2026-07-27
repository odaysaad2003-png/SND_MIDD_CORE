"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Bookmark, Flag, Heart, LoaderCircle, MessageCircle, RefreshCw} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

import {sndToast} from "@/components/feedback/toast/snd-toast-store";
import {Button} from "@/components/ui/button";
import {useAuth} from "@/features/auth/providers/auth-provider";
import {ReportDialog} from "@/features/reports/components/report-dialog";
import {cn} from "@/lib/utils/cn";

import {likePost, savePost, unlikePost, unsavePost} from "../api/post-interaction-api";
import {mapPostInteractionError} from "../errors/post-interaction-error-mapper";
import {useNearViewport} from "../hooks/use-near-viewport";
import {synchronizePostLikesCount} from "../lib/synchronize-post-caches";
import {likeStatusQueryOptions, postInteractionKeys, saveStatusQueryOptions} from "../queries/post-interaction.queries";
import type {LikeStatus, SaveStatus} from "../schemas/post-interaction.schema";

export type PostInteractionVariant = "feed" | "detail" | "saved" | "compact";

type PostInteractionActionsProps = Readonly<{
    postId: string;
    authorId: string;
    initialLikesCount: number;
    variant?: PostInteractionVariant;
}>;

type LikeMutationContext = Readonly<{
    previous: LikeStatus;
}>;

type SaveMutationContext = Readonly<{
    previous: SaveStatus;
}>;

const countFormatter = new Intl.NumberFormat("ar-PS");

function currentReturnTo(): string {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function loginHref(): string {
    return `/login?${new URLSearchParams({
        returnTo: currentReturnTo(),
    }).toString()}`;
}

export function PostInteractionActions({
    postId,
    authorId,
    initialLikesCount,
    variant = "feed",
}: PostInteractionActionsProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const {status, user} = useAuth();

    const {elementRef, isNearViewport} = useNearViewport<HTMLDivElement>(variant === "detail");

    const [feedback, setFeedback] = useState<string | null>(null);
    const [reportOpen, setReportOpen] = useState(false);

    const canLoadViewerState = status === "authenticated" && isNearViewport;

    const likeStatus = useQuery(likeStatusQueryOptions(postId, canLoadViewerState));

    const saveStatus = useQuery(saveStatusQueryOptions(postId, canLoadViewerState));

    useEffect(() => {
        if (likeStatus.data) {
            synchronizePostLikesCount(queryClient, postId, likeStatus.data.likesCount);
        }
    }, [likeStatus.data, postId, queryClient]);

    const likeMutation = useMutation<LikeStatus, unknown, boolean, LikeMutationContext>({
        mutationFn: (shouldLike) => (shouldLike ? likePost(postId) : unlikePost(postId)),

        onMutate: async (shouldLike) => {
            setFeedback(null);

            await queryClient.cancelQueries({
                queryKey: postInteractionKeys.likeStatus(postId),
            });

            const previous = queryClient.getQueryData<LikeStatus>(postInteractionKeys.likeStatus(postId));

            if (!previous) {
                throw new Error("Like state is not resolved");
            }

            const optimistic: LikeStatus = {
                likedByMe: shouldLike,
                likesCount: Math.max(0, previous.likesCount + (shouldLike ? 1 : -1)),
            };

            queryClient.setQueryData(postInteractionKeys.likeStatus(postId), optimistic);

            synchronizePostLikesCount(queryClient, postId, optimistic.likesCount);

            return {previous};
        },

        onSuccess: (serverStatus) => {
            queryClient.setQueryData(postInteractionKeys.likeStatus(postId), serverStatus);

            synchronizePostLikesCount(queryClient, postId, serverStatus.likesCount);
        },

        onError: (error, _shouldLike, context) => {
            if (context) {
                queryClient.setQueryData(postInteractionKeys.likeStatus(postId), context.previous);

                synchronizePostLikesCount(queryClient, postId, context.previous.likesCount);
            }

            const message = mapPostInteractionError(error);

            setFeedback(message.description);
            sndToast.error(message);
        },

        onSettled: (_data, error) => {
            if (error) {
                void queryClient.invalidateQueries({
                    queryKey: postInteractionKeys.likeStatus(postId),
                });
            }
        },
    });

    const saveMutation = useMutation<SaveStatus, unknown, boolean, SaveMutationContext>({
        mutationFn: (shouldSave) => (shouldSave ? savePost(postId) : unsavePost(postId)),

        onMutate: async (shouldSave) => {
            setFeedback(null);

            await queryClient.cancelQueries({
                queryKey: postInteractionKeys.saveStatus(postId),
            });

            const previous = queryClient.getQueryData<SaveStatus>(postInteractionKeys.saveStatus(postId));

            if (!previous) {
                throw new Error("Save state is not resolved");
            }

            queryClient.setQueryData(postInteractionKeys.saveStatus(postId), {
                savedByMe: shouldSave,
            });

            return {previous};
        },

        onSuccess: (serverStatus) => {
            queryClient.setQueryData(postInteractionKeys.saveStatus(postId), serverStatus);
        },

        onError: (error, _shouldSave, context) => {
            if (context) {
                queryClient.setQueryData(postInteractionKeys.saveStatus(postId), context.previous);
            }

            const message = mapPostInteractionError(error);

            setFeedback(message.description);
            sndToast.error(message);
        },

        onSettled: (_data, error) => {
            if (error) {
                void queryClient.invalidateQueries({
                    queryKey: postInteractionKeys.saveStatus(postId),
                });
            }
        },
    });

    const authenticated = status === "authenticated";
    const likeResolved = authenticated && likeStatus.isSuccess;
    const saveResolved = authenticated && saveStatus.isSuccess;

    const liked = likeStatus.data?.likedByMe;
    const saved = saveStatus.data?.savedByMe;

    const likesCount = likeStatus.data?.likesCount ?? initialLikesCount;

    const isCompact = variant === "compact";

    function requireAuthentication(): boolean {
        if (status === "authenticated") {
            return true;
        }

        if (status === "anonymous") {
            router.push(loginHref());
        }

        return false;
    }

    function navigateToComments(): void {
        if (!requireAuthentication()) {
            return;
        }

        const isCurrentDetail = window.location.pathname === `/posts/${postId}`;

        const target = isCurrentDetail
            ? `${window.location.pathname}${window.location.search}#comments`
            : `/posts/${postId}#comments`;

        router.push(target);
    }

    const hasStatusError = authenticated && (likeStatus.isError || saveStatus.isError);

    return (
        <div ref={elementRef} className="grid min-w-0 gap-2">
            <div
                className={cn(
                    "flex min-w-0 flex-wrap items-center gap-1 rounded-2xl border border-border/80 bg-surface-muted/45 p-1",
                    isCompact ? "justify-between" : "justify-start"
                )}
                aria-label="تفاعلات المنشور"
            >
                <Button
                    type="button"
                    variant="ghost"
                    size={isCompact ? "icon" : "default"}
                    className={cn("min-h-11 min-w-11", isCompact && "w-auto px-3", liked && "text-danger")}
                    aria-pressed={liked}
                    aria-label={liked ? "إزالة الإعجاب من المنشور" : "الإعجاب بالمنشور"}
                    aria-busy={likeMutation.isPending || (authenticated && likeStatus.isPending)}
                    disabled={status === "checking" || likeMutation.isPending || (authenticated && !likeResolved)}
                    onClick={() => {
                        if (requireAuthentication() && liked !== undefined) {
                            likeMutation.mutate(!liked);
                        }
                    }}
                >
                    {likeMutation.isPending || (authenticated && likeStatus.isPending) ? (
                        <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                    ) : (
                        <Heart aria-hidden="true" className={cn(liked && "fill-current")} />
                    )}

                    {!isCompact ? <span>{liked ? "أعجبني" : "إعجاب"}</span> : null}

                    <span dir="ltr" className="tabular-nums">
                        {countFormatter.format(likesCount)}
                    </span>
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size={isCompact ? "icon" : "default"}
                    className={cn("min-h-11 min-w-11", saved && "text-brand")}
                    aria-pressed={saved}
                    aria-label={saved ? "إزالة المنشور من المحفوظات" : "حفظ المنشور"}
                    aria-busy={saveMutation.isPending || (authenticated && saveStatus.isPending)}
                    disabled={status === "checking" || saveMutation.isPending || (authenticated && !saveResolved)}
                    onClick={() => {
                        if (requireAuthentication() && saved !== undefined) {
                            saveMutation.mutate(!saved);
                        }
                    }}
                >
                    {saveMutation.isPending || (authenticated && saveStatus.isPending) ? (
                        <LoaderCircle aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
                    ) : (
                        <Bookmark aria-hidden="true" className={cn(saved && "fill-current")} />
                    )}

                    {!isCompact ? <span>{saved ? "محفوظ" : "حفظ"}</span> : null}
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size={isCompact ? "icon" : "default"}
                    className="min-h-11 min-w-11"
                    aria-label="الانتقال إلى تعليقات المنشور"
                    disabled={status === "checking"}
                    onClick={navigateToComments}
                >
                    <MessageCircle aria-hidden="true" />

                    {!isCompact ? <span>تعليق</span> : null}
                </Button>

                {user?.id !== authorId ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size={isCompact ? "icon" : "default"}
                        className="min-h-11 min-w-11"
                        aria-label="الإبلاغ عن المنشور"
                        disabled={status === "checking"}
                        onClick={() => setReportOpen(true)}
                    >
                        <Flag aria-hidden="true" />

                        {!isCompact ? <span>إبلاغ</span> : null}
                    </Button>
                ) : null}
            </div>

            <ReportDialog
                open={reportOpen}
                target={{
                    type: "post",
                    id: postId,
                }}
                onOpenChange={setReportOpen}
            />

            {hasStatusError ? (
                <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="justify-self-start"
                    disabled={likeStatus.isFetching || saveStatus.isFetching}
                    onClick={() => {
                        setFeedback(null);

                        void Promise.all([likeStatus.refetch(), saveStatus.refetch()]);
                    }}
                >
                    <RefreshCw
                        aria-hidden="true"
                        className={cn(
                            (likeStatus.isFetching || saveStatus.isFetching) &&
                                "animate-spin motion-reduce:animate-none"
                        )}
                    />
                    إعادة مزامنة التفاعلات
                </Button>
            ) : null}

            <p aria-live="polite" className="min-h-5 text-xs text-danger">
                {feedback}
            </p>
        </div>
    );
}
