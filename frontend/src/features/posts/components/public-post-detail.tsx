import {Heart} from "lucide-react";
import Link from "next/link";

import {Avatar} from "@/components/ui/avatar";
import {buttonVariants} from "@/components/ui/button";
import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card";
import {cn} from "@/lib/utils/cn";

import type {PublicPost} from "../schemas/public-posts.schema";
import {PublicPostImages} from "./public-post-images";

const postDateTimeFormatter = new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Gaza",
});

const postCountFormatter = new Intl.NumberFormat("ar-PS");

type PublicPostDetailProps = Readonly<{
    post: PublicPost;
}>;

export function PublicPostDetail({post}: PublicPostDetailProps) {
    const titleId = `public-post-detail-title-${post.id}`;
    const wasEdited = post.updatedAt !== post.createdAt;

    return (
        <Card aria-labelledby={titleId} className="overflow-hidden">
            <CardHeader className="gap-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                        <Avatar imageUrl={post.author.avatar} name={post.author.name} className="size-12" sizes="48px" />

                        <div className="min-w-0">
                            <p className="truncate font-semibold text-foreground">{post.author.name}</p>
                            <p className="text-sm text-muted-foreground">كاتب المنشور</p>
                        </div>
                    </div>

                    <Link
                        href="/posts"
                        className={cn(buttonVariants({size: "sm", variant: "secondary"}), "shrink-0")}
                    >
                        العودة للمنشورات
                    </Link>
                </div>

                <div className="grid gap-3">
                    <h1 id={titleId} className="break-words text-2xl font-bold leading-tight text-foreground sm:text-3xl">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        <time dateTime={post.createdAt}>
                            نُشر في {postDateTimeFormatter.format(new Date(post.createdAt))}
                        </time>

                        {wasEdited ? (
                            <time dateTime={post.updatedAt}>
                                · آخر تحديث {postDateTimeFormatter.format(new Date(post.updatedAt))}
                            </time>
                        ) : null}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid gap-6">
                <p className="whitespace-pre-wrap break-words text-base leading-8 text-foreground">
                    {post.content}
                </p>

                <PublicPostImages images={post.images} title={post.title} />
            </CardContent>

            <CardFooter>
                <div
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                    aria-label={`عدد الإعجابات: ${post.likesCount}`}
                >
                    <Heart aria-hidden="true" className="size-4" />
                    <span>الإعجابات</span>
                    <span dir="ltr" className="font-semibold text-foreground">
                        {postCountFormatter.format(post.likesCount)}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}
