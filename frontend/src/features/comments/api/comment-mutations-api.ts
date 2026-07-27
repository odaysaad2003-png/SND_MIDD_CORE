import {authorizedApiRequest} from "@/features/auth/api/authorized-api-client";
import {ApiError} from "@/lib/api/api-error";

import {
    commentMutationInputSchema,
    commentMutationResultSchema,
    type CommentMutationInput,
    type PublicComment,
} from "../schemas/public-comments.schema";

type RequestOptions = Readonly<{signal?: AbortSignal}>;

function parseComment(result: unknown, postId: string): PublicComment {
    const parsed = commentMutationResultSchema.safeParse(result);

    if (!parsed.success || parsed.data.data.post !== postId) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The comment response does not match the verified API contract",
        });
    }

    return parsed.data.data;
}

export async function createComment(
    postId: string,
    input: CommentMutationInput,
    options: RequestOptions = {},
): Promise<PublicComment> {
    const payload = commentMutationInputSchema.parse(input);
    const result = await authorizedApiRequest<unknown>(
        `posts/${encodeURIComponent(postId)}/comments`,
        {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload), signal: options.signal},
    );

    return parseComment(result, postId);
}

export async function updateComment(
    comment: Pick<PublicComment, "id" | "post">,
    input: CommentMutationInput,
    options: RequestOptions = {},
): Promise<PublicComment> {
    const payload = commentMutationInputSchema.parse(input);
    const result = await authorizedApiRequest<unknown>(
        `comments/${encodeURIComponent(comment.id)}`,
        {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify(payload), signal: options.signal},
    );

    return parseComment(result, comment.post);
}

export async function deleteComment(
    commentId: string,
    options: RequestOptions = {},
): Promise<void> {
    const result = await authorizedApiRequest<unknown>(
        `comments/${encodeURIComponent(commentId)}`,
        {method: "DELETE", signal: options.signal},
    );

    if (result.data !== undefined || Object.hasOwn(result, "meta")) {
        throw new ApiError({
            kind: "invalid-response",
            message: "The delete comment response does not match the verified API contract",
        });
    }
}
