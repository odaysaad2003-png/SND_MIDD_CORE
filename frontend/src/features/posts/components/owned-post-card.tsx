"use client";

import {Heart, Images} from "lucide-react";

import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";

import type {PublicPost} from "../schemas/public-posts.schema";
import {PostManagementActions} from "./post-management-actions";
import {PublicPostImages} from "./public-post-images";

const postDateFormatter = new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Gaza",
});

const postCountFormatter = new Intl.NumberFormat("ar-PS");

type OwnedPostCardProps = Readonly<{
    post: PublicPost;
    onDeleted: () => void;
}>;

export function OwnedPostCard({post, onDeleted}: OwnedPostCardProps) {
    const wasEdited = post.updatedAt !== post.createdAt;

    return (
        <Card className="overflow-hidden rounded-[1.75rem] transition-[border-color,box-shadow] duration-300 hover:border-brand/25 hover:shadow-lg">
            <CardHeader className="gap-4 p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full border border-success/25 bg-success/10 px-2.5 py-1 font-bold text-success">
                                منشور نشط
                            </span>
                            <time dateTime={post.createdAt}>نُشر {postDateFormatter.format(new Date(post.createdAt))}</time>
                            {wasEdited ? (
                                <time dateTime={post.updatedAt}>· عُدّل {postDateFormatter.format(new Date(post.updatedAt))}</time>
                            ) : null}
                        </div>

                        <h2 className="break-words text-xl font-bold leading-8 text-foreground sm:text-2xl">
                            {post.title}
                        </h2>
                    </div>

                    <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-border bg-surface-muted/55 px-3 py-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5" aria-label={`عدد الصور: ${post.images.length}`}>
                            <Images aria-hidden="true" className="size-4" />
                            <span dir="ltr" className="font-bold text-foreground">{post.images.length}/5</span>
                        </span>
                        <span aria-hidden="true" className="h-4 w-px bg-border" />
                        <span className="inline-flex items-center gap-1.5" aria-label={`عدد الإعجابات: ${post.likesCount}`}>
                            <Heart aria-hidden="true" className="size-4" />
                            <span dir="ltr" className="font-bold text-foreground">
                                {postCountFormatter.format(post.likesCount)}
                            </span>
                        </span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid gap-5 px-5 pb-5 sm:px-6 sm:pb-6">
                <p className="line-clamp-5 whitespace-pre-wrap break-words text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
                    {post.content}
                </p>

                <PublicPostImages images={post.images} title={post.title} />
            </CardContent>

            <CardFooter className="bg-surface-muted/40 p-4 sm:px-6">
                <PostManagementActions post={post} variant="workspace" onDeleted={onDeleted} />
            </CardFooter>
        </Card>
    );
}
