import {ArrowUpLeft} from "lucide-react";
import Link from "next/link";

import {Avatar} from "@/components/ui/avatar";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {PostInteractionActions} from "@/features/post-interactions/components/post-interaction-actions";
import {cn} from "@/lib/utils/cn";

import type {PublicPost} from "../schemas/public-posts.schema";
import {CurrentUserPostActions} from "./current-user-post-actions";
import {PublicPostImages} from "./public-post-images";

const postDateFormatter = new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "medium",
    timeZone: "Asia/Gaza",
});

type PublicPostCardProps = Readonly<{
    featured?: boolean;
    post: PublicPost;
}>;

export function PublicPostCard({featured = false, post}: PublicPostCardProps) {
    const titleId = `public-post-title-${post.id}`;

    return (
        <Card
            aria-labelledby={titleId}
            className={cn(
                "group flex h-full flex-col overflow-hidden transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-brand/35 hover:shadow-lg",
                featured && "border-brand/25 bg-[linear-gradient(145deg,var(--surface),color-mix(in_oklch,var(--brand)_6%,var(--surface)))]",
            )}
        >
            <CardHeader className="gap-4">
                <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <Avatar imageUrl={post.author.avatar} name={post.author.name} />
                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{post.author.name}</p>
                            <time dateTime={post.createdAt} className="text-xs text-muted-foreground">
                                {postDateFormatter.format(new Date(post.createdAt))}
                            </time>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                        {featured ? (
                            <span className="rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                                الأحدث
                            </span>
                        ) : null}

                        <CurrentUserPostActions post={post} variant="compact" />
                    </div>
                </div>

                <h3 id={titleId} className="break-words text-lg font-bold leading-8 text-foreground">
                    <Link href={`/posts/${post.id}`} className="rounded-sm transition-colors hover:text-brand">
                        {post.title}
                    </Link>
                </h3>
            </CardHeader>

            <CardContent className="grid flex-1 gap-4">
                <p className="line-clamp-3 whitespace-pre-line break-words text-sm leading-7 text-muted-foreground">
                    {post.content}
                </p>
                <PublicPostImages images={post.images} title={post.title} />
            </CardContent>

            <CardFooter className="flex-wrap justify-between gap-3">
                <PostInteractionActions
                    postId={post.id}
                    initialLikesCount={post.likesCount}
                    variant="compact"
                />

                <Link href={`/posts/${post.id}`} className={cn(buttonVariants({size: "sm", variant: "secondary"}), "group/link")}>
                    قراءة المنشور
                    <ArrowUpLeft aria-hidden="true" className="transition-transform group-hover/link:-translate-x-0.5 group-hover/link:-translate-y-0.5" />
                </Link>
            </CardFooter>
        </Card>
    );
}
