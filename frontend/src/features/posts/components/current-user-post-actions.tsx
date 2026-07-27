"use client";

import {useAuth} from "@/features/auth/providers/auth-provider";

import type {PublicPost} from "../schemas/public-posts.schema";
import {PostManagementActions} from "./post-management-actions";

type CurrentUserPostActionsProps = Readonly<{
    post: PublicPost;
    variant: "compact" | "detail";
    afterDeleteHref?: string;
    refreshAfterMutation?: boolean;
}>;

export function CurrentUserPostActions({
    post,
    variant,
    afterDeleteHref,
    refreshAfterMutation,
}: CurrentUserPostActionsProps) {
    const {status, user} = useAuth();

    if (status !== "authenticated" || !user || user.id !== post.author.id) {
        return null;
    }

    return (
        <PostManagementActions
            post={post}
            variant={variant}
            afterDeleteHref={afterDeleteHref}
            refreshAfterMutation={refreshAfterMutation}
        />
    );
}
