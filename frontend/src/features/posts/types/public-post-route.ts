import type {PublicCommentsRawSearchParams} from "@/features/comments/lib/public-comments-url-state";

export type PublicPostPageProps = Readonly<{
    params: Promise<{postId: string; }>;
    searchParams: Promise<PublicCommentsRawSearchParams>;
}>;
